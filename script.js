const form = document.getElementById("codeForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = {
    player: formData.get("player"),
    code: formData.get("code")
  };

  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    alert("Code submitted! ✅");
    form.reset();
  } else {
    alert("Error: " + result.error);
  }
});