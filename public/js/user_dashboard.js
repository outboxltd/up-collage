function RegisterTransaction(CourseID, userID) {
    return new Promise((resolve, reject) => {
        fetch("/registerTransaction", {

            // Adding method type 
            method: "POST",

            // Add body parameters
            body: JSON.stringify({
                UserID: userID,
                CourseID: CourseID
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

async function buyCourse(e, userID) {
    /*

     * send post request to server(POST /registerTransaction)
     * if it succeeds then show success popup else fail popup
     
    */

    let CourseID = e.id.split("Course")[1]

    e.classList.add("disabled")

    let registerTransactionRequest = await RegisterTransaction(CourseID, userID)

    let alertID = `BuyingCourse${CourseID}`

    if (registerTransactionRequest) {
        /*
          • show popup
          • change status
          • make the specification button clickable
        */

        // show popup
        let alertText = `נרשמת במערכת עבור קורס מזהה <code>${CourseID}</code>, מנהל מערכת יחזור אלייך בהקדם האפשרי`
        ShowAlert(alertID, alertText, 'alert-success', '.alerts')
        FadeRemoveAlert(alertID, 5000)

        // change status
        let columnStatus = document.querySelector(`#TransactionStatus${CourseID}`)
        columnStatus.innerText = "בקשת רכישה בתהליך"

        // make the specification button clickable
        let specificationButton = document.querySelector(`#SpecificationCourse${CourseID}`)
        specificationButton.classList.remove("disabled")
    } else {
        RemoveAlert(alertID)
        e.classList.remove("disabled")
    }
}

function viewCourse(e) {
    let CourseID = e.id.split("Course")[1]
    localStorage["courseID"] = CourseID
    window.location.replace(`/coursePage?courseID=${CourseID}`)
}