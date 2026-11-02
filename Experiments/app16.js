"use strict";
class ComplainEase {
    accounts = [
        { username: "admin", password: "admin123", role: "admin" }
    ];
    complaints = [];
    currentUser = "";
    role = "";
    nextId = 1;
    complaintEnabled = true;
    value(id) {
        return document.getElementById(id).value.trim();
    }
    message(id, text) {
        document.getElementById(id).textContent = text;
    }
    registerUser() {
        const username = this.value("username");
        const password = this.value("password");
        if (!username || !password)
            return alert("Enter username and password.");
        if (this.accounts.some(a => a.username === username))
            return alert("Username already exists.");
        this.accounts.push({ username, password, role: "user" });
        alert("Registration successful. Please log in.");
    }
    loginUser() {
        const username = this.value("username");
        const password = this.value("password");
        const account = this.accounts.find(a => a.username === username && a.password === password && a.role === "user");
        if (!account)
            return alert("Invalid user login.");
        this.currentUser = username;
        this.role = "user";
        this.message("userMsg", "Logged in as " + username);
        this.render();
    }
    loginOfficer() {
        const username = this.value("officerName");
        const password = this.value("officerPassword");
        const account = this.accounts.find(a => a.username === username && a.password === password && a.role === "officer");
        if (!account)
            return alert("Invalid officer login.");
        this.currentUser = username;
        this.role = "officer";
        this.message("officerMsg", "Welcome, " + username);
        this.render();
    }
    loginAdmin() {
        const username = this.value("adminName");
        const password = this.value("adminPassword");
        const account = this.accounts.find(a => a.username === username && a.password === password && a.role === "admin");
        if (!account)
            return alert("Invalid admin login.");
        this.currentUser = username;
        this.role = "admin";
        this.message("adminMsg", "Admin login successful.");
        this.render();
    }
    logout() {
        this.currentUser = "";
        this.role = "";
        this.message("userMsg", "Logged out.");
        this.message("officerMsg", "");
        this.message("adminMsg", "");
        this.render();
    }
    postComplaint() {
        if (this.role !== "user")
            return alert("Please log in as a user.");
        if (!this.complaintEnabled)
            return alert("Complaint submission is disabled.");
        const title = this.value("complaintTitle");
        const description = this.value("description");
        const location = this.value("location");
        if (!title || !description || !location)
            return alert("Complete all complaint fields.");
        const file = document.getElementById("proof").files?.[0];
        this.complaints.push({
            id: this.nextId++,
            user: this.currentUser,
            title,
            category: this.value("category"),
            description,
            location,
            status: "Submitted",
            proof: file?.name || "No attachment",
            feedback: ""
        });
        alert("Complaint submitted successfully.");
        this.render();
    }
    sendFeedback() {
        if (this.role !== "user")
            return alert("Please log in first.");
        const text = this.value("feedback");
        const complaint = this.complaints.find(c => c.user === this.currentUser);
        if (!complaint)
            return alert("Submit a complaint first.");
        complaint.feedback = text;
        alert("Feedback saved.");
        this.render();
    }
    createOfficer() {
        if (this.role !== "admin")
            return alert("Admin login required.");
        const username = this.value("newOfficer");
        const password = this.value("newOfficerPass");
        if (!username || !password)
            return alert("Enter officer ID and password.");
        if (this.accounts.some(a => a.username === username))
            return alert("Account already exists.");
        this.accounts.push({ username, password, role: "officer" });
        this.render();
    }
    deleteAccount(username) {
        if (this.role !== "admin")
            return alert("Admin login required.");
        if (username === "admin")
            return alert("Cannot delete the default admin.");
        this.accounts = this.accounts.filter(a => a.username !== username);
        this.render();
    }
    updateFeatures() {
        if (this.role !== "admin")
            return alert("Admin login required.");
        this.complaintEnabled =
            document.getElementById("featureComplaint").checked;
        alert("Feature settings updated.");
    }
    updateStatus(id, status) {
        if (this.role !== "officer" && this.role !== "admin")
            return alert("Officer or admin login required.");
        const complaint = this.complaints.find(c => c.id === id);
        if (complaint)
            complaint.status = status;
        this.render();
    }
    render() {
        const card = (c, canEdit) => `<div class="card"><b>#${c.id} ${c.title}</b>
      <p>${c.category} | ${c.location}</p>
      <p>${c.description}</p><p>Status: ${c.status}</p>
      <p>Attachment: ${c.proof}</p><p>Feedback: ${c.feedback || "None"}</p>
      <a target="_blank" href="https://maps.google.com/?q=${encodeURIComponent(c.location)}">View Map</a>
      ${canEdit ? `<br><button onclick="app.updateStatus(${c.id},'In Progress')">In Progress</button>
      <button onclick="app.updateStatus(${c.id},'Resolved')">Resolved</button>` : ""}
      </div>`;
        document.getElementById("userComplaints").innerHTML =
            this.complaints.filter(c => c.user === this.currentUser)
                .map(c => card(c, false)).join("") || "No complaints yet.";
        document.getElementById("officerComplaints").innerHTML =
            this.role === "officer" || this.role === "admin"
                ? this.complaints.map(c => card(c, true)).join("") || "No complaints yet."
                : "Login as officer to view complaints.";
        document.getElementById("adminComplaints").innerHTML =
            this.role === "admin"
                ? this.complaints.map(c => card(c, true)).join("") || "No complaints yet."
                : "Admin login required.";
        document.getElementById("accounts").innerHTML =
            this.role === "admin"
                ? this.accounts.map(a => `${a.username} (${a.role})
          ${a.role !== "admin" ? `<button onclick="app.deleteAccount('${a.username}')">Delete</button>` : ""}`)
                    .join("<br>")
                : "Admin login required.";
    }
}
const app = new ComplainEase();
