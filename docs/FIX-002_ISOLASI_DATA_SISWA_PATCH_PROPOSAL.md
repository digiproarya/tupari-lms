# FIX-002 — Isolasi akses data siswa (patch proposal)
Branch: `audit/backend-security-2026-10-16`
Status: patch proposal untuk review; belum diterapkan ke GAS produksi.

## Mengapa patch ini disiapkan sebagai proposal
Folder backend GAS belum ada di branch `main`. Karena itu, jangan menambahkan satu file backend seolah-olah repositori sudah menjadi sumber deployment lengkap. Patch berikut menunjukkan perubahan minimal yang perlu diterapkan ke arsip backend aktif, lalu diuji pada salinan spreadsheet dan deployment GAS uji.

## 1. Tambahkan helper otorisasi ke `backend-gas/Students.gs`

Letakkan sebelum `const Students = {`:

```javascript
function studentUserSchoolIds_(user) {
  if (!user) return [];
  var raw = user.schoolIds;
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch (err) {
      // A malformed scope must fail closed; do not infer access from it.
    }
  }
  if (user.activeSchoolId) return [String(user.activeSchoolId)];
  return [];
}

function assertStudentSchoolAccess_(user, schoolId, allowStudentSelf) {
  if (!user || !user.id || !user.role) {
    throw new Error('Unauthorized: authenticated user context required');
  }
  if (user.role === 'super_admin') return true;

  // A student cannot use school-scoped list/create/import/update endpoints.
  if (user.role === 'siswa' && !allowStudentSelf) {
    throw new Error('Forbidden: student access is limited to their own record');
  }

  var allowed = studentUserSchoolIds_(user);
  if (!schoolId || allowed.indexOf(String(schoolId)) === -1) {
    throw new Error('Forbidden: school access denied');
  }
  return true;
}
```

## 2. Ubah signature dan filter `Students.getStudents`

Ganti awal fungsi:

```javascript
getStudents: function(params) {
  try {
    params = params || {};
    var user = params.user;
    var requestedSchoolId = params.schoolId;
    if (user && user.role === 'super_admin') {
      // super_admin may query a specific school or all schools.
    } else {
      var allowedSchoolIds = studentUserSchoolIds_(user);
      if (!allowedSchoolIds.length) throw new Error('Forbidden: no school scope');
      if (requestedSchoolId && allowedSchoolIds.indexOf(String(requestedSchoolId)) === -1) {
        throw new Error('Forbidden: school access denied');
      }
      // Never return records across schools for a school-scoped account.
      if (!requestedSchoolId) {
        if (allowedSchoolIds.length !== 1) {
          throw new Error('Forbidden: select one authorized school');
        }
        requestedSchoolId = allowedSchoolIds[0];
      }
      assertStudentSchoolAccess_(user, requestedSchoolId, false);
    }
    var schoolId = requestedSchoolId;
    var classId = params.classId;
    var search = params.search;
    var status = params.status;
    var records = Database.getAll(CONFIG.SHEETS.STUDENTS);
    if (schoolId) records = records.filter(function(r) { return String(r.schoolId) === String(schoolId); });
    if (classId) records = records.filter(function(r) { return String(r.classId) === String(classId); });
    if (status) records = records.filter(function(r) { return r.status === status; });
    if (search) {
      var query = String(search).toLowerCase();
      records = records.filter(function(r) {
        return String(r.name || '').toLowerCase().indexOf(query) !== -1 ||
          String(r.nis || '').indexOf(query) !== -1 ||
          String(r.nisn || '').indexOf(query) !== -1;
      });
    }
    return { success: true, data: records };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
},
```

Important: this deliberately fails closed if a non-super-admin has no school scope. If users in the actual sheet use a different role naming convention, reconcile that before applying.

## 3. Change `getStudent` to require the authenticated user

```javascript
getStudent: function(studentId, user) {
  try {
    if (!user || !user.id || !user.role) throw new Error('Unauthorized');
    var student = Database.getById(CONFIG.SHEETS.STUDENTS, studentId);
    if (!student) return { success: false, error: 'Student not found' };

    if (user.role !== 'super_admin') {
      assertStudentSchoolAccess_(user, student.schoolId, true);
      if (user.role === 'siswa' && String(student.userId || '') !== String(user.id)) {
        throw new Error('Forbidden: student may access only their own record');
      }
    }
    return { success: true, data: student };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
},
```

Before applying this exact self-check, verify whether the actual STUDENTS sheet links a student to USERS using `userId`, or a different column. If no reliable link exists, student-role access to this endpoint must remain denied until the mapping is implemented.

## 4. Gate create, update, and bulk import

At the start of each corresponding try block:
- `createStudent(data)`: require `data.user`; call `assertStudentSchoolAccess_(data.user, data.schoolId, false)`; strip the trusted context before writing: clone data and delete `user`.
- `updateStudent(studentId, data)`: fetch the existing student first; require `data.user`; authorize against the existing student's `schoolId`; reject attempts to change `schoolId` unless the caller is `super_admin`; strip `user` and `studentId` from the object sent to `Database.update`.
- `bulkImport(schoolId, students, user)`: require `user`; authorize school; overwrite each incoming record's `schoolId` with the authorized school ID. Never trust a per-row schoolId supplied by the client.

## 5. Minimal router changes in `backend-gas/Code.gs`

GET:
```javascript
case 'getStudent':
  result = Students.getStudent(params.studentId, params.user);
  break;
```

POST:
```javascript
case 'createStudent':
  result = Students.createStudent(payload);
  break;
case 'updateStudent':
  result = Students.updateStudent(payload.studentId, payload);
  break;
case 'bulkImportStudents':
  result = Students.bulkImport(payload.schoolId, payload.students, user);
  break;
```

The POST router already adds the verified `user` to `payload`; keep that assignment server-side. Never accept `payload.user` as authenticated context before the router overwrites it.

## 6. Test matrix before applying to a deployment

| Scenario | Expected |
|---|---|
| `super_admin` lists a specific school | Allowed |
| `super_admin` lists all schools | Allowed only if intended and explicitly requested |
| School admin reads own school | Allowed |
| School admin requests another school's ID | Denied |
| School-scoped user omits schoolId with one allowed school | Restricted to that school |
| User has multiple schools but omits schoolId | Denied until one is selected |
| User has no valid school scope | Denied |
| Student tries list/create/update/import | Denied |
| Student reads own record with verified userId mapping | Allowed only if explicitly intended |
| Student reads another student's record | Denied |
| Client submits a forged `payload.user` | Ignored; router's verified user wins |
| Update tries to move a student to another school | Denied for non-super-admin |
| Bulk import contains mixed schoolIds | All rows assigned to authorized school or reject input; never cross-write |

## 7. Release gate
1. Confirm STUDENTS columns and USERS role/schoolIds format in a copy of the spreadsheet.
2. Apply changes only in a test copy of the GAS project.
3. Run the matrix above with at least two school accounts and one student account.
4. Verify no unrelated endpoints or sheets changed.
5. Export/backup current GAS source and spreadsheet before any production rollout.
6. Do not deploy to the active web app until the tests pass and the user explicitly approves.
