function register(event) {
    event.preventDefault(); // don't refresh the page

    const username = document.getElementById("userNameInput").value.trim();
    const email    = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passInput").value.trim();
    const rePass   = document.getElementById("rePassInput").value.trim();

    // if you don't have DOB / admin fields in the form, just use defaults:
    const dob = "";          // or document.getElementById("dobInput").value;
    const isAdmin = false;   // or from a checkbox

    // 1) check passwords match
    if (password !== rePass) {
        alert("Passwords do not match");
        return;
    }

    // 2) check if username already exists – PDF: if(find(username)) { ... }
    if (find(username)) {
        alert("Username already exists");
        return;
    }

    // (optional) you can also check email:
    // if (find(email)) {
    //     alert("Email already exists");
    //     return;
    // }

    // 3) add new user to JSON (PDF: add(username, email, password, dob, isAdmin);)
    add(username, email, password, dob, isAdmin);

    alert("User registered! db.json updated (downloaded).");

    // optional: clear form
    document.getElementById("userNameInput").value = "";
    document.getElementById("emailInput").value    = "";
    document.getElementById("passInput").value     = "";
    document.getElementById("rePassInput").value   = "";
}
