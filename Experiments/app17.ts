
type Candidate = {
  id: number;
  name: string;
  party: string;
  ward: string;
  votes: number;
};

type VoteRecord = {
  voterId: string;
  candidateName: string;
  time: string;
};

const candidates: Candidate[] = [
  { id: 1, name: "Candidate A", party: "Party A", ward: "Ward 1", votes: 0 },
  { id: 2, name: "Candidate B", party: "Party B", ward: "Ward 1", votes: 0 },
  { id: 3, name: "Candidate C", party: "Independent", ward: "Ward 1", votes: 0 }
];

const voters = new Set<string>(["VOTER101", "VOTER102"]);
const records: VoteRecord[] = [];
const voted = new Set<string>();

let currentVoter = "";
let loginOTP = "";
let votingOTP = "";
let selectedCandidate = 0;
let adminAuthenticated = false;

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function showSection(id: string): void {
  document.querySelectorAll("main section").forEach(section =>
    section.classList.add("hidden")
  );
  el(id).classList.remove("hidden");

  if (id === "vote") renderCandidates();
  if (id === "history") renderHistory();
}

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function requestLoginOTP(): void {
  const id = el<HTMLInputElement>("voterId").value.trim().toUpperCase();

  if (!voters.has(id)) {
    el("loginMessage").textContent = "Voter ID not found in the voter list.";
    return;
  }

  loginOTP = generateOTP();
  // Demo only: displaying OTP is not secure authentication.
  el("loginMessage").textContent = `Demo login OTP: ${loginOTP}`;
}

function verifyLogin(): void {
  const id = el<HTMLInputElement>("voterId").value.trim().toUpperCase();
  const otp = el<HTMLInputElement>("loginOtp").value.trim();

  if (!voters.has(id) || !loginOTP || otp !== loginOTP) {
    el("loginMessage").textContent = "Invalid Voter ID or OTP.";
    return;
  }

  currentVoter = id;
  loginOTP = "";
  el("loginMessage").textContent = `Welcome, ${currentVoter}! Login successful.`;
  el("voterMessage").textContent = `Logged in as ${currentVoter}`;
  renderCandidates();
}

function requestVotingOTP(): void {
  if (!currentVoter) {
    el("voteMessage").textContent = "Please log in first.";
    return;
  }

  if (voted.has(currentVoter)) {
    el("voteMessage").textContent = "You have already voted.";
    return;
  }

  votingOTP = generateOTP();
  // Demo only. A real OTP must be delivered through a secure provider.
  el("voteMessage").textContent = `Demo voting OTP: ${votingOTP}`;
}

function renderCandidates(): void {
  const list = el("candidateList");
  list.innerHTML = "";

  candidates.forEach(candidate => {
    const item = document.createElement("div");
    item.className = "candidate";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "candidate";
    radio.value = String(candidate.id);
    radio.style.width = "auto";

    const label = document.createElement("label");
    label.textContent = ` ${candidate.name} — ${candidate.party} (${candidate.ward})`;

    radio.addEventListener("change", () => {
      selectedCandidate = candidate.id;
    });

    item.append(radio, label);
    list.appendChild(item);
  });
}

function submitVote(): void {
  if (!currentVoter) {
    el("voteMessage").textContent = "Please log in first.";
    return;
  }

  if (voted.has(currentVoter)) {
    el("voteMessage").textContent = "A vote has already been recorded for this demo voter.";
    return;
  }

  const otp = el<HTMLInputElement>("voteOtp").value.trim();
  if (!votingOTP || otp !== votingOTP) {
    el("voteMessage").textContent = "Verify your voting OTP first.";
    return;
  }

  const candidate = candidates.find(c => c.id === selectedCandidate);
  if (!candidate) {
    el("voteMessage").textContent = "Please select a candidate.";
    return;
  }

  candidate.votes++;
  voted.add(currentVoter);
  records.push({
    voterId: currentVoter,
    candidateName: candidate.name,
    time: new Date().toLocaleString()
  });

  votingOTP = "";
  el("voteMessage").textContent = "Demo vote submitted successfully!";
  renderHistory();
  renderCandidates();
}

function renderHistory(): void {
  const area = el("historyList");
  area.innerHTML = "";

  if (!currentVoter) {
    area.textContent = "Please log in to view your voting history.";
    return;
  }

  const ownRecords = records.filter(r => r.voterId === currentVoter);

  if (ownRecords.length === 0) {
    area.textContent = "No votes recorded in this demo session.";
    return;
  }

  ownRecords.forEach(record => {
    const p = document.createElement("p");
    p.textContent = `Vote confirmation: ${record.candidateName} — ${record.time}`;
    area.appendChild(p);
  });
}

function adminLogin(): void {
  const username = el<HTMLInputElement>("adminUser").value;
  const password = el<HTMLInputElement>("adminPass").value;

  if (username === "admin" && password === "admin123") {
    adminAuthenticated = true;
    el("adminTools").classList.remove("hidden");
    renderVoters();
  } else {
    alert("Invalid demo admin credentials.");
  }
}

function addCandidate(): void {
  if (!adminAuthenticated) return;

  const name = el<HTMLInputElement>("candidateName").value.trim();
  const party = el<HTMLInputElement>("candidateParty").value.trim();
  const ward = el<HTMLInputElement>("candidateWard").value.trim();

  if (!name || !party || !ward) {
    alert("Enter candidate name, party, and ward.");
    return;
  }

  candidates.push({
    id: Date.now(),
    name,
    party,
    ward,
    votes: 0
  });

  renderCandidates();
  alert("Candidate added.");
}

function addVoter(): void {
  if (!adminAuthenticated) return;

  const id = el<HTMLInputElement>("newVoter").value.trim().toUpperCase();
  if (!id) {
    alert("Enter a Voter ID.");
    return;
  }

  voters.add(id);
  renderVoters();
}

function importVoters(): void {
  if (!adminAuthenticated) return;

  const file = el<HTMLInputElement>("voterFile").files?.[0];
  if (!file) {
    alert("Choose a .txt file first.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    String(reader.result)
      .split(/\r?\n/)
      .map(id => id.trim().toUpperCase())
      .filter(Boolean)
      .forEach(id => voters.add(id));

    renderVoters();
    alert("Voter list imported for this demo.");
  };
  reader.readAsText(file);
}

function renderVoters(): void {
  const area = el("voterList");
  area.innerHTML = "";

  voters.forEach(id => {
    const p = document.createElement("p");
    p.textContent = id;
    area.appendChild(p);
  });
}

function showResults(): void {
  if (!adminAuthenticated) return;

  const area = el("results");
  area.innerHTML = "";

  candidates.forEach(candidate => {
    const p = document.createElement("p");
    p.textContent = `${candidate.name} (${candidate.party}): ${candidate.votes} demo votes`;
    area.appendChild(p);
  });
}

renderCandidates();
