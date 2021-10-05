function ChangeTranscationStatus(TransactionId, isAllowed) {
    return new Promise((resolve, reject) => {
        fetch("/admin/ChangeTranscationStatus", {

            // Adding method type 
            method: "POST",

            // Add body parameters
            body: JSON.stringify({
                TransactionID: TransactionId,
                isAllowed: isAllowed,
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

            .catch((err) => {
                resolve(false)
            })
    })
}

async function Accept_Deny_User(e, TransactionId, isAllowed) {
    /*

     * call ChangeTranscationStatus()
     * if it succeeds then show success popup else fail popup
     
    */

    let TransactionID = e.id.split("Transaction")[1]

    e.classList.add("disabled")

    let ChangeTranscationStatusRequest = await ChangeTranscationStatus(TransactionId, isAllowed)

    let alertID = `TransactionAlert${TransactionID}`

    if (ChangeTranscationStatusRequest) {
        /*
          • show popup
          • delete row
        */

        // show popup
        let alertText = isAllowed ? `המשתמש אושר בהצלחה` : "המשתמש נדחה בהצלחה"
        ShowAlert(alertID, alertText, 'alert-success', '.alerts')
        FadeRemoveAlert(alertID, 5000)

        // delete row
        let column = document.querySelector(`tr#TransactionRow${TransactionID}`)
        column.remove()

    } else {
        let alertText = "קיימת בעיה, אנא פנו לעזרה הטכנית"
        ShowAlert(alertID, alertText, 'alert-danger', '.alerts')
        FadeRemoveAlert(alertID, 5000)
        e.classList.remove("disabled")
    }
}

function makeEditable(e) {
    // editable - property contenteditable="true", undertext line, pen turns into v
    let EventRow = e.parentElement
    let aTag = EventRow.children[1]
    let isEditable = aTag.attributes.contenteditable === undefined ? false : aTag.attributes.contenteditable.value === "true" ? true : false

    if (!isEditable) {
        aTag.setAttribute("contenteditable", true)
        aTag.setAttribute("style", `text-decoration: underline;border-style: double;`)
        e.classList.remove("fa-pencil")
        e.classList.add("fa-check")
    } else {
        aTag.setAttribute("contenteditable", false)
        aTag.setAttribute("style", ``)
        e.classList.remove("fa-check")
        e.classList.add("fa-pencil")
    }

}