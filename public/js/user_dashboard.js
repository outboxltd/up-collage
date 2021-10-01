function ShowSuccessAlert(id, message) {

    let alertTextTemplate = `<center><strong>${message}</strong></center>`

    let alertsDiv = document.querySelector('.alerts')
    let alertDiv = `<div class="alert alert-success alert-dismissible fade show" id=${id} role="alert">
    <a style="direction: rtl;" id="successAlertText">${alertTextTemplate}</a>
    <button type="button" class="close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
</div>`

    alertsDiv.innerHTML = alertDiv

    let alert = document.querySelector(`#${id}`)

    alert.classList.add("show")
}

function RemoveSuccessAlert(id) {
    $(`#${id}`).alert('close')
}

async function buyCourse(e, userID) {
    /*

     * send post request to server(POST /registerTransaction)
     * if it succeeds then show success popup else fail popup
     
    */

    e.classList.add("disabled")

    let registerTransactionRequest = await RegisterTransaction(e, userID)

    let alertID = `BuyingCourse${e.id}`

    if (registerTransactionRequest) {
        /*
          • show popup
          • change status
        */

        // show popup
        let alertText = `נרשמת במערכת עבור קורס מזהה <code>${e.id}</code>, מנהל מערכת יחזור אלייך בהקדם האפשרי`
        ShowSuccessAlert(alertID, alertText)
        let alert = document.querySelector(`#${alertID}`)
        setTimeout(() => {
            if (alert) {
                RemoveSuccessAlert(alertID)
            }
        }, 5000)

        // change status
        let columnStatus = document.querySelector(`#TransactionStatus${e.id}`)
        columnStatus.innerText = "בקשת רכישה בתהליך"
    } else {
        RemoveSuccessAlert(alertID)
        e.classList.remove("disabled")
    }
}

function RegisterTransaction(e, userID) {
    return new Promise((resolve, reject) => {
        fetch("/registerTransaction", {

            // Adding method type 
            method: "POST",

            // Add body parameters
            body: JSON.stringify({
                UserID: userID,
                CourseID: e.id
            }),

            // Adding headers to the request 
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        })
            .then(response =>
                response.json()
            )

            .then(json => {
                if (json.code === 200) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
    })
}