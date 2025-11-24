// שם קובץ ה-JSON
const file = "src/db.json";

// כאן יישמרו המשתמשים מהקובץ
let users = [];

// פונקציה שקוראת את הקובץ db.json וממלאת את המערך users
function initUsers() {
    let rawFile = new XMLHttpRequest();       // יצירת בקשה חדשה
    rawFile.open("GET", file, false);         // פתיחת הבקשה (סינכרוני)
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {       // הבקשה הסתיימה
            if (rawFile.status === 200 || rawFile.status == 0) {
                let allText = rawFile.responseText; // הטקסט מהקובץ
                let data = JSON.parse(allText);     // המרת טקסט ל-object
                users = data.users;                 // שמירת המערך הגלובלי
            }
        }
    };
    rawFile.send(null);                        // שליחת הבקשה
}

// פונקציה למציאת משתמש לפי username או email
function find(nameOrMail) {
    if (users.length == 0) {   // אם עדיין לא קראנו מהקובץ
        initUsers();
    }
    // מחזירים את המשתמש שה-username או המייל שלו שווים לפרמטר
    return users.find(u => u.username === nameOrMail || u.email === nameOrMail);
}

// פונקציה שמעדכנת את קובץ ה-JSON (מורידה קובץ חדש)
function updateData() {
    // בניית המחרוזת בפורמט JSON כמו בהתחלה
    let data = '{ "users": ' + JSON.stringify(users) + '}';

    // יצירת Blob (אובייקט בינארי מהטקסט)
    const blob = new Blob([data], { type: 'application/json' });

    // יצירת URL זמני לקובץ
    const url = URL.createObjectURL(blob);

    // יצירת אלמנט <a> להורדת הקובץ
    const a = document.createElement('a');
    a.download = "db.json";    // שם הקובץ שיורד
    a.href = url;
    a.click();                 // "לחיצה" כדי להתחיל הורדה

    URL.revokeObjectURL(url);  // ניקוי ה-URL מהזיכרון
}

// פונקציה להוספת משתמש חדש
function add(username, email, password, dob, isAdmin) {
    // לקרוא את המשתמשים מהקובץ (אם עדיין לא)
    initUsers();

    // יצירת אובייקט משתמש חדש
    let user = {
        "username": username,
        "email": email,
        "password": password,
        "dob": dob,
        "isAdmin": isAdmin
    };

    // הוספה למערך
    users.push(user);

    // עדכון קובץ ה-JSON (מוריד קובץ חדש db.json)
    updateData();
}
