function ChangeTranscationStatus(TransactionId, UserID, isAllowed) {
    return new Promise((resolve, reject) => {
        fetch("/admin/ChangeTranscationStatus", {

            // Adding method type 
            method: "POST",

            // Add body parameters
            body: JSON.stringify({
                TransactionID: TransactionId,
                UserID: UserID,
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

async function Accept_Deny_User(e, TransactionId, UserID, isAllowed) {
    /*

     * call ChangeTranscationStatus()
     * if it succeeds then show success popup else fail popup
     
    */

    let TransactionID = e.id.split("Transaction")[1]
    let AcceptBtn = document.querySelector(`#AcceptTransaction${TransactionID}`)
    let DenyBtn = document.querySelector(`#DenyTransaction${TransactionID}`)

    AcceptBtn.classList.add("disabled")
    DenyBtn.classList.add("disabled")

    let ChangeTranscationStatusRequest = await ChangeTranscationStatus(TransactionId, UserID, isAllowed)

    let alertID = `TransactionAlert${TransactionID}`

    if (ChangeTranscationStatusRequest) {
        /*
          • show popup
          • delete row -- No
          • add selected class
          • change status + change last date of status update
        */

        AcceptBtn.classList.remove("disabled")
        DenyBtn.classList.remove("disabled")

        // show popup
        let alertText = isAllowed ? `המשתמש אושר בהצלחה` : "המשתמש נדחה בהצלחה"
        ShowAlert(alertID, alertText, 'alert-success', '.alerts')
        FadeRemoveAlert(alertID, 5000)

        // add selected class
        let OtherBtn = e.id === AcceptBtn.id ? AcceptBtn : DenyBtn
        if (OtherBtn.classList.contains("selected")) OtherBtn.classList.remove("selected")
        e.classList.add("selected")

        // change status + change last date of status update
        let statusText = document.querySelector(`#StatusTransaction${TransactionID}`);
        let ChangedStatusDateText = document.querySelector(`#ChangedStatusDateTransaction${TransactionID}`);
        statusText.innerText = isAllowed ? `מאושר` : "דחוי";
        ChangedStatusDateText.innerText = moment().format('DD/MM/YYYY');
    } else {
        let alertText = "קיימת בעיה, אנא פנו לעזרה הטכנית"
        ShowAlert(alertID, alertText, 'alert-danger', '.alerts')
        FadeRemoveAlert(alertID, 5000)
        AcceptBtn.classList.remove("disabled")
        DenyBtn.classList.remove("disabled")
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