const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}

// Initialize file if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

const getUsers = () => {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
};

module.exports = { getUsers, saveUsers };
