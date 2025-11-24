function login(event) {
    event.preventDefault(); // prevent page refresh

    const usernameOrEmail = document.getElementById("userInput").value.trim();
    const password = document.getElementById("passInput").value.trim();

    // use the find() function from users.js
    let user = find(usernameOrEmail);

    if (!user) {
        alert("User not found");
        return;
    }

    if (user.password !== password) {
        alert("Wrong password");
        return;
    }

    alert("Login successful!");

    // optional: redirect to another page:
    // window.location.href = "home.html";
}
