const db = require('../config/database');

class TypeOfExamModel {
    async getAll() {
        const [rows] = await db.execute('SELECT * FROM type_of_exam');
        return rows;
    }

    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM type_of_exam WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = new TypeOfExamModel();
