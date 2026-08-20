const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const getDbPath = () => path.join(app.getPath('userData'), 'emr.db');

let db = null;

function getDb() {
  if (!db) {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    createSchema();
    runMigrations();
  }
  return db;
}

function createSchema() {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      nic TEXT DEFAULT '',
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      bloodGroup TEXT DEFAULT '',
      maritalStatus TEXT DEFAULT '',
      occupation TEXT DEFAULT '',
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      emergencyContact TEXT DEFAULT '',
      photo TEXT DEFAULT '',
      allergies TEXT DEFAULT '[]',
      chronicDiseases TEXT DEFAULT '',
      currentMedications TEXT DEFAULT '',
      previousSurgeries TEXT DEFAULT '',
      familyMedicalHistory TEXT DEFAULT '',
      smokingStatus TEXT DEFAULT 'Never',
      alcoholConsumption TEXT DEFAULT 'Never',
      height REAL DEFAULT 0,
      weight REAL DEFAULT 0,
      bmi REAL,
      vaccinationHistory TEXT DEFAULT '',
      medicalNotes TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      chiefComplaint TEXT DEFAULT '',
      historyOfPresentIllness TEXT DEFAULT '',
      physicalExamination TEXT DEFAULT '',
      diagnosis TEXT DEFAULT '',
      treatmentPlan TEXT DEFAULT '',
      clinicalNotes TEXT DEFAULT '',
      followupDate TEXT,
      vitals TEXT DEFAULT '{}',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      consultationId TEXT NOT NULL,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      medicines TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT DEFAULT '',
      status TEXT DEFAULT 'Scheduled',
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      diagnosis TEXT DEFAULT '',
      restPeriod TEXT DEFAULT '',
      issueDate TEXT NOT NULL,
      doctorRemarks TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'Other Documents',
      fileData TEXT DEFAULT '',
      uploadDate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      description TEXT DEFAULT '',
      createdAt TEXT NOT NULL,
      user TEXT DEFAULT 'system',
      immutable INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      consultationId TEXT,
      specialistName TEXT DEFAULT '',
      facility TEXT DEFAULT '',
      reason TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending',
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      type TEXT DEFAULT 'followup',
      title TEXT DEFAULT '',
      message TEXT DEFAULT '',
      dueDate TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      relatedId TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS changelog (
      id TEXT PRIMARY KEY,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      field TEXT NOT NULL,
      oldValue TEXT DEFAULT '',
      newValue TEXT DEFAULT '',
      changedAt TEXT NOT NULL,
      changedBy TEXT DEFAULT 'doctor',
      undoData TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS doctor (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT DEFAULT 'Dr. Sarah Smith',
      regNumber TEXT DEFAULT '',
      specialization TEXT DEFAULT '',
      clinicName TEXT DEFAULT '',
      clinicAddress TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      signature TEXT,
      role TEXT DEFAULT 'admin'
    );

    CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patientId);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patientId);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patientId);
    CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(createdAt);
    CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patientId);
    CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patientId);
    CREATE INDEX IF NOT EXISTS idx_changelog_entity ON changelog(entityId);
  `);

  const doctorCount = database.prepare('SELECT COUNT(*) as count FROM doctor').get().count;
  if (doctorCount === 0) {
    database.prepare(`
      INSERT INTO doctor (name, regNumber, specialization, clinicName, clinicAddress, phone, email, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Dr. Sarah Smith',
      'MED-8472-TX',
      'General Practice & Cardiology',
      'MediCare Primary Clinic',
      '123 Health Ave, Suite 100, Medical City, TX 75001',
      '(555) 123-4567',
      'contact@medicareclinic.com',
      'admin'
    );
  }
}

function runMigrations() {
  const database = getDb();
  try {
    // Check schema version to determine if migrations are needed
    const versionRow = database.prepare("SELECT value FROM settings WHERE key = 'db_schema_version'").get();
    const currentVersion = versionRow ? parseInt(versionRow.value) : 0;

    if (currentVersion < 2) {
      // Migration v2: Fix corrupted patient allergies (stored as '[object Object]' or raw JS)
      // and wipe duplicate seed data caused by broken seedInitialData check
      console.log('[DB Migration] Running v2 migration: fixing corrupted data...');

      // Delete duplicate patients – keep the one with the latest createdAt per NIC if NIC is set,
      // otherwise just wipe all patients that were from seeding (they will be re-seeded correctly)
      // The simplest safe approach: delete the settings seeded flag so the app re-seeds properly
      database.prepare("DELETE FROM settings WHERE key = 'emr_seeded'").run();

      // Fix any patient rows where allergies is not valid JSON
      const patients = database.prepare('SELECT id, allergies FROM patients').all();
      for (const p of patients) {
        if (!p.allergies) {
          database.prepare("UPDATE patients SET allergies = '[]' WHERE id = ?").run(p.id);
        } else {
          try {
            JSON.parse(p.allergies);
          } catch {
            // Not valid JSON - clear it
            database.prepare("UPDATE patients SET allergies = '[]' WHERE id = ?").run(p.id);
          }
        }
      }

      // Fix any consultation rows where vitals is not valid JSON
      const consultations = database.prepare('SELECT id, vitals FROM consultations').all();
      for (const c of consultations) {
        if (!c.vitals) {
          database.prepare("UPDATE consultations SET vitals = '{}' WHERE id = ?").run(c.id);
        } else {
          try {
            JSON.parse(c.vitals);
          } catch {
            database.prepare("UPDATE consultations SET vitals = '{}' WHERE id = ?").run(c.id);
          }
        }
      }

      // Fix any prescription rows where medicines is not valid JSON
      const prescriptions = database.prepare('SELECT id, medicines FROM prescriptions').all();
      for (const p of prescriptions) {
        if (!p.medicines) {
          database.prepare("UPDATE prescriptions SET medicines = '[]' WHERE id = ?").run(p.id);
        } else {
          try {
            JSON.parse(p.medicines);
          } catch {
            database.prepare("UPDATE prescriptions SET medicines = '[]' WHERE id = ?").run(p.id);
          }
        }
      }

      database.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('db_schema_version', '2')").run();
      console.log('[DB Migration] v2 migration complete.');
    }
  } catch (err) {
    console.error('[DB Migration] Migration failed:', err.message);
  }
}

function serializeRow(row) {
  if (!row) return null;
  const obj = { ...row };
  for (const key of Object.keys(obj)) {
    if (obj[key] === null || obj[key] === undefined) {
      obj[key] = '';
    }
  }
  return obj;
}

function toJson(val) {
  if (val === null || val === undefined) return '[]';
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
}

function fromJson(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function fromJsonObject(val) {
  if (!val) return {};
  try { return JSON.parse(val); } catch { return {}; }
}

// Serialize any array/object values to JSON strings before writing to SQLite
function serializeForWrite(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) || (v !== null && typeof v === 'object')) {
      out[k] = JSON.stringify(v);
    } else if (v === undefined) {
      out[k] = null;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Deserialize a patient row: parse allergies JSON string -> array
function deserializePatient(row) {
  if (!row) return null;
  const obj = serializeRow(row);
  obj.allergies = fromJson(obj.allergies);
  return obj;
}

// Deserialize a consultation row: parse vitals JSON string -> object
function deserializeConsultation(row) {
  if (!row) return null;
  const obj = serializeRow(row);
  obj.vitals = fromJsonObject(obj.vitals);
  return obj;
}

// Deserialize a prescription row: parse medicines JSON string -> array
function deserializePrescription(row) {
  if (!row) return null;
  const obj = serializeRow(row);
  obj.medicines = fromJson(obj.medicines);
  return obj;
}

module.exports = {
  getDbPath,
  getDb,

  query(sql, params = []) {
    const database = getDb();
    try {
      const rows = database.prepare(sql).all(...params);
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  get(table, id) {
    const database = getDb();
    try {
      const row = database.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
      if (!row) return { success: true, data: null };
      let data;
      if (table === 'patients') data = deserializePatient(row);
      else if (table === 'consultations') data = deserializeConsultation(row);
      else if (table === 'prescriptions') data = deserializePrescription(row);
      else data = serializeRow(row);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  insert(table, data) {
    const database = getDb();
    try {
      const serialized = serializeForWrite(data);
      const keys = Object.keys(serialized);
      const placeholders = keys.map(() => '?').join(',');
      const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
      const result = database.prepare(sql).run(...Object.values(serialized));
      return { success: true, id: String(result.lastInsertRowid) };
    } catch (err) {
      console.error(`insert error in ${table}:`, err.message, data);
      return { success: false, error: err.message };
    }
  },

  update(table, id, data) {
    const database = getDb();
    try {
      const serialized = serializeForWrite(data);
      const keys = Object.keys(serialized);
      const setClause = keys.map(k => `${k} = ?`).join(',');
      const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
      database.prepare(sql).run(...Object.values(serialized), id);
      return { success: true };
    } catch (err) {
      console.error(`update error in ${table}:`, err.message, data);
      return { success: false, error: err.message };
    }
  },

  delete(table, id) {
    const database = getDb();
    try {
      database.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  deleteByPatient(table, patientId) {
    const database = getDb();
    try {
      database.prepare(`DELETE FROM ${table} WHERE patientId = ?`).run(patientId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  clear(table) {
    const database = getDb();
    try {
      database.prepare(`DELETE FROM ${table}`).run();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  list(table) {
    return this.query(`SELECT * FROM ${table} ORDER BY createdAt DESC`);
  },

  count(table) {
    const database = getDb();
    try {
      const row = database.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      return { success: true, count: row.count };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  searchPatients(query) {
    const database = getDb();
    try {
      const rows = database.prepare(`
        SELECT * FROM patients
        WHERE firstName LIKE ? OR lastName LIKE ? OR id LIKE ? OR phone LIKE ?
        ORDER BY createdAt DESC
      `).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
      return { success: true, data: rows.map(r => deserializePatient(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getConsultationsByPatient(patientId) {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM consultations WHERE patientId = ? ORDER BY date DESC').all(patientId);
      return { success: true, data: rows.map(r => deserializeConsultation(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getPrescriptionsByPatient(patientId) {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM prescriptions WHERE patientId = ? ORDER BY date DESC').all(patientId);
      return { success: true, data: rows.map(r => deserializePrescription(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getDocumentsByPatient(patientId) {
    return this.query('SELECT * FROM documents WHERE patientId = ? ORDER BY uploadDate DESC', [patientId]);
  },

  getDocuments() {
    return this.query('SELECT * FROM documents ORDER BY uploadDate DESC');
  },

  getAppointments() {
    return this.query('SELECT * FROM appointments ORDER BY date ASC, time ASC');
  },

  getCertificates() {
    return this.query('SELECT * FROM certificates ORDER BY issueDate DESC');
  },

  getActivityLogs() {
    return this.query('SELECT * FROM logs ORDER BY createdAt DESC LIMIT 1000');
  },

  getReferrals() {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM referrals ORDER BY createdAt DESC').all();
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getReferralsByPatient(patientId) {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM referrals WHERE patientId = ? ORDER BY createdAt DESC').all(patientId);
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getReminders() {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM reminders ORDER BY dueDate ASC').all();
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getRemindersByPatient(patientId) {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM reminders WHERE patientId = ? ORDER BY dueDate ASC').all(patientId);
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getChangeLogs() {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM changelog ORDER BY changedAt DESC LIMIT 1000').all();
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getChangeHistory(entityType, entityId) {
    const database = getDb();
    try {
      let rows;
      if (entityType && entityId) {
        rows = database.prepare('SELECT * FROM changelog WHERE entityType = ? AND entityId = ? ORDER BY changedAt DESC').all(entityType, entityId);
      } else if (entityType) {
        rows = database.prepare('SELECT * FROM changelog WHERE entityType = ? ORDER BY changedAt DESC').all(entityType);
      } else {
        rows = database.prepare('SELECT * FROM changelog ORDER BY changedAt DESC LIMIT 1000').all();
      }
      return { success: true, data: rows.map(r => serializeRow(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getPatients() {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM patients ORDER BY createdAt DESC').all();
      return { success: true, data: rows.map(r => deserializePatient(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getConsultations() {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM consultations ORDER BY date DESC').all();
      return { success: true, data: rows.map(r => deserializeConsultation(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getPrescriptions() {
    const database = getDb();
    try {
      const rows = database.prepare('SELECT * FROM prescriptions ORDER BY date DESC').all();
      return { success: true, data: rows.map(r => deserializePrescription(r)) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getSettings(key) {
    const database = getDb();
    try {
      const row = database.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return row ? row.value : null;
    } catch {
      return null;
    }
  },

  setSettings(key, value) {
    const database = getDb();
    try {
      database.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getDoctorProfile() {
    const database = getDb();
    try {
      const row = database.prepare('SELECT * FROM doctor LIMIT 1').get();
      return serializeRow(row);
    } catch {
      return null;
    }
  },

  saveDoctorProfile(data) {
    const database = getDb();
    try {
      const serialized = serializeForWrite(data);
      const keys = Object.keys(serialized);
      const setClause = keys.map(k => `${k} = ?`).join(',');
      database.prepare(`UPDATE doctor SET ${setClause} WHERE id = 1`).run(...Object.values(serialized));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  exportAll() {
    const result = {
      schemaVersion: '2.0.0',
      exportedAt: new Date().toISOString(),
      doctor: this.getDoctorProfile(),
      patients: this.getPatients().data || [],
      consultations: this.getConsultations().data || [],
      prescriptions: this.getPrescriptions().data || [],
      appointments: this.getAppointments().data || [],
      certificates: this.getCertificates().data || [],
      documents: this.query('SELECT * FROM documents').data || [],
      referrals: this.getReferrals().data || [],
      reminders: this.getReminders().data || [],
      logs: this.getActivityLogs().data || [],
      changelog: this.getChangeLogs().data || []
    };
    return { success: true, data: result };
  },

  importBackup(backupData) {
    const database = getDb();
    try {
      database.prepare("BEGIN TRANSACTION").run();
      try {
        const tables = ['patients', 'consultations', 'prescriptions', 'appointments', 'certificates', 'documents', 'logs', 'referrals', 'reminders', 'changelog', 'doctor'];
        for (const table of tables) {
          if (table === 'doctor') {
            database.prepare(`DELETE FROM doctor WHERE id != 1`).run();
          } else {
            database.prepare(`DELETE FROM ${table}`).run();
          }
        }
        
        if (backupData.patients && Array.isArray(backupData.patients)) {
          const stmt = database.prepare(`
            INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const p of backupData.patients) {
            stmt.run(
              p.id, p.firstName, p.lastName, p.nic || '', p.dob, p.gender,
              p.bloodGroup || '', p.maritalStatus || '', p.occupation || '',
              p.phone, p.email || '', p.address || '', p.emergencyContact || '',
              p.photo || '', toJson(p.allergies || []), p.chronicDiseases || '',
              p.currentMedications || '', p.previousSurgeries || '', p.familyMedicalHistory || '',
              p.smokingStatus || 'Never', p.alcoholConsumption || 'Never',
              p.height || 0, p.weight || 0, p.bmi || null,
              p.vaccinationHistory || '', p.medicalNotes || '', p.createdAt
            );
          }
        }
        
        if (backupData.consultations && Array.isArray(backupData.consultations)) {
          const stmt = database.prepare(`
            INSERT INTO consultations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const c of backupData.consultations) {
            stmt.run(
              c.id, c.patientId, c.date, c.time,
              c.chiefComplaint || '', c.historyOfPresentIllness || '', c.physicalExamination || '',
              c.diagnosis || '', c.treatmentPlan || '', c.clinicalNotes || '',
              c.followupDate || null, toJson(c.vitals || {}), c.createdAt
            );
          }
        }

        if (backupData.prescriptions && Array.isArray(backupData.prescriptions)) {
          const stmt = database.prepare(`
            INSERT INTO prescriptions VALUES (?, ?, ?, ?, ?)
          `);
          for (const p of backupData.prescriptions) {
            stmt.run(p.id, p.consultationId, p.patientId, p.date, toJson(p.medicines || []));
          }
        }

        if (backupData.appointments && Array.isArray(backupData.appointments)) {
          const stmt = database.prepare(`
            INSERT INTO appointments VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          for (const a of backupData.appointments) {
            stmt.run(a.id, a.patientId, a.date, a.time, a.reason || '', a.status || 'Scheduled', a.notes || '');
          }
        }

        if (backupData.certificates && Array.isArray(backupData.certificates)) {
          const stmt = database.prepare(`
            INSERT INTO certificates VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const c of backupData.certificates) {
            stmt.run(c.id, c.patientId, c.diagnosis || '', c.restPeriod || '', c.issueDate, c.doctorRemarks || '');
          }
        }

        if (backupData.documents && Array.isArray(backupData.documents)) {
          const stmt = database.prepare(`
            INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const d of backupData.documents) {
            stmt.run(d.id, d.patientId, d.name, d.type || 'Other Documents', d.fileData || '', d.uploadDate);
          }
        }

        if (backupData.logs && Array.isArray(backupData.logs)) {
          const stmt = database.prepare(`
            INSERT INTO logs VALUES (?, ?, ?, ?, ?, ?)
          `);
          for (const l of backupData.logs) {
            stmt.run(l.id, l.action, l.description || '', l.createdAt, l.user || 'system', l.immutable ? 1 : 0);
          }
        }

        if (backupData.referrals && Array.isArray(backupData.referrals)) {
          const stmt = database.prepare(`
            INSERT INTO referrals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const r of backupData.referrals) {
            stmt.run(r.id, r.patientId, r.consultationId || null, r.specialistName || '', r.facility || '', r.reason || '', r.notes || '', r.status || 'Pending', r.date || '', r.createdAt || '');
          }
        }

        if (backupData.reminders && Array.isArray(backupData.reminders)) {
          const stmt = database.prepare(`
            INSERT INTO reminders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const r of backupData.reminders) {
            stmt.run(r.id, r.patientId, r.type || 'followup', r.title || '', r.message || '', r.dueDate || '', r.status || 'pending', r.relatedId || null, r.createdAt || '');
          }
        }

        if (backupData.changelog && Array.isArray(backupData.changelog)) {
          const stmt = database.prepare(`
            INSERT INTO changelog VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const c of backupData.changelog) {
            stmt.run(c.id, c.entityType, c.entityId, c.field, c.oldValue || '', c.newValue || '', c.changedAt, c.changedBy || 'doctor', c.undoData || null);
          }
        }

        if (backupData.doctor) {
          const d = backupData.doctor;
          database.prepare(`
            UPDATE doctor SET name = ?, regNumber = ?, specialization = ?, clinicName = ?,
            clinicAddress = ?, phone = ?, email = ?, signature = ?, role = ? WHERE id = 1
          `).run(
            d.name || 'Dr. Sarah Smith', d.regNumber || '', d.specialization || '',
            d.clinicName || '', d.clinicAddress || '', d.phone || '', d.email || '',
            d.signature || null, d.role || 'admin'
          );
        }
        database.prepare("COMMIT").run();
        return { success: true };
      } catch (err) {
        database.prepare("ROLLBACK").run();
        return { success: false, error: err.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
