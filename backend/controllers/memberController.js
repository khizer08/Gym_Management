const pool = require('../config/db');
// hello
const memberController = {
    // Add new member
    async addMember(req, res) {
        const connection = await pool.getConnection();
        try {
            const {
                member_name,
                member_age,
                member_gender,
                member_phone,
                member_email,
                membership_plan,
                assigned_trainer
            } = req.body;

            // Generate unique member ID
            const member_prefix = 'IPG';
            const random_number = Math.floor(Math.random() * 90000) + 10000;
            const member_id = `${member_prefix}${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${random_number}`;

            // Calculate membership dates
            const start_date = new Date();
            let end_date = new Date();
            
            switch (membership_plan) {
                case 'Monthly':
                    end_date.setMonth(end_date.getMonth() + 1);
                    break;
                case 'Quarterly':
                    end_date.setMonth(end_date.getMonth() + 3);
                    break;
                case 'Yearly':
                    end_date.setFullYear(end_date.getFullYear() + 1);
                    break;
            }

            await connection.beginTransaction();

            // Insert into members table
            const [result] = await connection.execute(
                `INSERT INTO members 
                (member_id, name, age, gender, phone, email, membership_plan, 
                assigned_trainer_id, join_date, membership_start, membership_end) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
                [
                    member_id,
                    member_name,
                    member_age,
                    member_gender,
                    member_phone,
                    member_email,
                    membership_plan,
                    assigned_trainer,
                    start_date,
                    end_date
                ]
            );

            // Insert into membership_history
            await connection.execute(
                `INSERT INTO membership_history 
                (member_id, plan_type, start_date, end_date, is_active) 
                VALUES (?, ?, ?, ?, 1)`,
                [result.insertId, membership_plan, start_date, end_date]
            );

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Member added successfully!',
                member_id,
                membership_end: end_date
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error adding member:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding member',
                error: error.message
            });
        } finally {
            connection.release();
        }
    },

    // Get all members
    async getAllMembers(req, res) {
        try {
            const [members] = await pool.execute('SELECT * FROM members');
            res.json({
                success: true,
                data: members
            });
        } catch (error) {
            console.error('Error fetching members:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching members',
                error: error.message
            });
        }
    },

    // Get member by ID
    async getMemberById(req, res) {
        try {
            const [members] = await pool.execute(
                'SELECT * FROM members WHERE member_id = ?',
                [req.params.id]
            );

            if (members.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            res.json({
                success: true,
                data: members[0]
            });
        } catch (error) {
            console.error('Error fetching member:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching member',
                error: error.message
            });
        }
    },

    // Update member
    async updateMember(req, res) {
        const connection = await pool.getConnection();
        try {
            const {
                member_name,
                member_age,
                member_gender,
                member_phone,
                member_email,
                membership_plan,
                assigned_trainer
            } = req.body;

            await connection.beginTransaction();

            // Update member details
            await connection.execute(
                `UPDATE members 
                SET name = ?, age = ?, gender = ?, phone = ?, 
                    email = ?, membership_plan = ?, assigned_trainer_id = ?
                WHERE member_id = ?`,
                [
                    member_name,
                    member_age,
                    member_gender,
                    member_phone,
                    member_email,
                    membership_plan,
                    assigned_trainer,
                    req.params.id
                ]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Member updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error updating member:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating member',
                error: error.message
            });
        } finally {
            connection.release();
        }
    },

    // Delete member
    async deleteMember(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Delete from membership_history first (due to foreign key constraint)
            await connection.execute(
                'DELETE FROM membership_history WHERE member_id = ?',
                [req.params.id]
            );

            // Delete from members table
            await connection.execute(
                'DELETE FROM members WHERE member_id = ?',
                [req.params.id]
            );

            await connection.commit();

            res.json({
                success: true,
                message: 'Member deleted successfully'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Error deleting member:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting member',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = memberController; 