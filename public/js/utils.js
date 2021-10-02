function ShowAlert(id, message, alertClass, ParentDiv) {

    let alertTextTemplate = `<center><strong>${message}</strong></center>`

    let alertsDiv = document.querySelector(ParentDiv)
    let alertDiv = `<div class="alert ${alertClass} alert-dismissible fade show" id=${id} role="alert">
    <a style="direction: rtl;" id="successAlertText">${alertTextTemplate}</a>
    <button type="button" class="close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
</div>`

    alertsDiv.innerHTML = alertsDiv.innerHTML + alertDiv

    let alert = document.querySelector(`#${id}`)

    alert.classList.add("show")
}

function RemoveAlert(id) {
    $(`#${id}`).alert('close')
}

function FadeRemoveAlert(id, time) {
    let alert = document.querySelector(`#${id}`)
    setTimeout(() => {
        if (alert) {
            RemoveAlert(`${id}`)
        }
    }, time)
}