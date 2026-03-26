// script.js

let currentPlayer = null; // { firstName, lastName, isReturning }
let selectedTeamId = null;
let creatingNewTeam = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

function showStep(id) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function setError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearError(id) {
  document.getElementById(id).textContent = "";
}

function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Loading…';
  } else {
    btn.disabled = false;
  }
}

// ── Step 1: Validate game code ────────────────────────────────────────────────

document.getElementById("btn-code").addEventListener("click", async () => {
  const code = document.getElementById("code").value.trim();
  clearError("code-error");

  if (!code) return setError("code-error", "Please enter the game code.");

  const btn = document.getElementById("btn-code");
  setLoading(btn, true);

  try {
    const res = await fetch("/api/validate-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();

    if (data.valid) {
      showStep("step-name");
    } else {
      setError("code-error", "Invalid game code. Try again.");
    }
  } catch {
    setError("code-error", "Something went wrong. Try again.");
  } finally {
    btn.textContent = "Join →";
    btn.disabled = false;
  }
});

// ── Step 2: Check name ───────────────────────────────────────────────────────

document.getElementById("btn-name").addEventListener("click", async () => {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  clearError("name-error");

  if (!firstName || !lastName) return setError("name-error", "Please enter your full name.");

  const btn = document.getElementById("btn-name");
  setLoading(btn, true);

  try {
    const res = await fetch("/api/check-player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName })
    });
    const data = await res.json();

    currentPlayer = { firstName, lastName, isReturning: data.exists };

    if (data.exists) {
      document.getElementById("login-subtitle").textContent =
        `Good to see you again, ${firstName}. Enter your password to continue.`;
      showStep("step-login");
    } else {
      await loadTeams();
      showStep("step-register");
    }
  } catch {
    setError("name-error", "Something went wrong. Try again.");
  } finally {
    btn.textContent = "Continue →";
    btn.disabled = false;
  }
});

// ── Step 3a: Login ───────────────────────────────────────────────────────────

document.getElementById("btn-login").addEventListener("click", async () => {
  const password = document.getElementById("login-password").value;
  clearError("login-error");

  if (!password) return setError("login-error", "Please enter your password.");

  const btn = document.getElementById("btn-login");
  setLoading(btn, true);

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentPlayer, password })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById("success-title").textContent = `Welcome back, ${currentPlayer.firstName}.`;
      document.getElementById("success-msg").textContent =
        `You're signed in${data.team ? ` and on team "${data.team}"` : ""}.`;
      showStep("step-success");
    } else {
      setError("login-error", data.error || "Incorrect password.");
    }
  } catch {
    setError("login-error", "Something went wrong. Try again.");
  } finally {
    btn.textContent = "Sign In →";
    btn.disabled = false;
  }
});

// ── Step 3b: Load teams ──────────────────────────────────────────────────────

async function loadTeams() {
  const list = document.getElementById("team-list");
  list.innerHTML = '<p style="font-size:13px;color:var(--muted)">Loading teams…</p>';

  try {
    const res = await fetch("/api/teams");
    const data = await res.json();

    if (!data.teams || data.teams.length === 0) {
      list.innerHTML = '<p style="font-size:13px;color:var(--muted)">No teams yet. Create the first one!</p>';
      return;
    }

    list.innerHTML = "";
    data.teams.forEach(team => {
      const full = team.count >= 5;
      const btn = document.createElement("button");
      btn.className = "team-btn" + (full ? " full" : "");
      btn.disabled = full;
      btn.dataset.teamId = team._id;
      btn.innerHTML = `
        <span>${team.name}</span>
        <span class="count">${team.count}/5</span>
      `;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".team-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedTeamId = team._id;
        creatingNewTeam = false;
        document.getElementById("new-team-section").style.display = "none";
        document.getElementById("toggle-new-team").textContent = "+ Create a new team";
      });
      list.appendChild(btn);
    });
  } catch {
    list.innerHTML = '<p style="font-size:13px;color:var(--muted)">Failed to load teams.</p>';
  }
}

// ── Toggle new team input ─────────────────────────────────────────────────────

document.getElementById("toggle-new-team").addEventListener("click", () => {
  creatingNewTeam = !creatingNewTeam;
  document.getElementById("new-team-section").style.display = creatingNewTeam ? "block" : "none";
  document.getElementById("toggle-new-team").textContent = creatingNewTeam
    ? "← Pick an existing team instead"
    : "+ Create a new team";

  if (creatingNewTeam) {
    selectedTeamId = null;
    document.querySelectorAll(".team-btn").forEach(b => b.classList.remove("selected"));
  }
});

// ── Step 3b: Register ─────────────────────────────────────────────────────────

document.getElementById("btn-register").addEventListener("click", async () => {
  const password = document.getElementById("password").value;
  const grade = document.getElementById("grade").value;
  const teamName = document.getElementById("teamName").value.trim();
  clearError("register-error");

  if (!password) return setError("register-error", "Please choose a password.");
  if (!creatingNewTeam && !selectedTeamId) return setError("register-error", "Please select or create a team.");
  if (creatingNewTeam && !teamName) return setError("register-error", "Please enter a team name.");

  const btn = document.getElementById("btn-register");
  setLoading(btn, true);

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: currentPlayer.firstName,
        lastName: currentPlayer.lastName,
        password,
        grade,
        teamId: creatingNewTeam ? null : selectedTeamId,
        newTeamName: creatingNewTeam ? teamName : null
      })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById("success-title").textContent = `You're in, ${currentPlayer.firstName}.`;
      document.getElementById("success-msg").textContent =
        `You've joined team "${data.team}". Good luck.`;
      showStep("step-success");
    } else {
      setError("register-error", data.error || "Registration failed.");
    }
  } catch {
    setError("register-error", "Something went wrong. Try again.");
  } finally {
    btn.textContent = "Join Game →";
    btn.disabled = false;
  }
});