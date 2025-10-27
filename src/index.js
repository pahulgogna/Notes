
function populateButtonText() {
  
  const button = document.getElementById("button-text")

  let data = JSON.parse(localStorage.getItem('notes'))

  if (data && data.n > 1) {
    button.innerHTML = "Go to Notes"
  } else {
    button.innerHTML = "Create Your First Note"
  }

}

populateButtonText()

