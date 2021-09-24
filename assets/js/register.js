

let send2api = (fullname,org,phone,order_mail,number_of_teams,notes) => {
    const data = {fullname:fullname,org:org,phone:phone,order_mail:order_mail,number_of_teams:number_of_teams,notes:notes}
  
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
  

// fullname
// org
// phone
// order_mail
// number_of_teams
// notes



const form = document.getElementById("registerform");

form.addEventListener("submit", function (event) {
  const fullname = form.elements["fullname"].value;
  const org = form.elements["org"].value;
  const phone = form.elements["phone"].value;
  const order_mail = form.elements["order_mail"].value;
  const number_of_teams = form.elements["number_of_teams"].value;
  const notes = form.elements["notes"].value;

  send2api(fullname,org,phone,order_mail,number_of_teams,notes)
  console.log(fullname + org + phone + order_mail + number_of_teams + notes);


  event.preventDefault();
});



