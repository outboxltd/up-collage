let ProductID;

$(document).ready(async () => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    ProductID = params["courseID"]
})

function checks() {

    let inputs = Array.from(document.querySelectorAll("input.form-control")).map(element => element.value); //without generalnotes field
    let InstructorName = document.querySelector('input[name=CourseInstructorName]');
    let InstructorPhone = document.querySelector('input[name=CourseInstructorPhone]');
    let InstructorEmail = document.querySelector('input[name=CourseInstructorEmail]');
    let submitButton = document.querySelector('button[type=submit]');
    let errors = [];

    /* 
      * Check if all fields are empty(except GeneralNotes)
      * Check if FullName has a space
      * Check if phone number is valid
      * Check if email address is valid
    */

    // Check if all fields are empty(except GeneralNotes)
    if (inputs.includes("")) errors.push("ישנם מספר שורות ריקות");

    // Check if FullName has a space
    if (!InstructorName.value.includes(" ")) errors.push("שם מוביל הסדנה אינו מכיל שם משפחה/אין רווח בין השמות");

    // Validate Phone Number
    let PhoneValidationRegex = /^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
    if (!PhoneValidationRegex.test(InstructorPhone.value)) errors.push("מספר הטלפון אינו תקין או ריק, מס/' הטלפון אמור להיות בפורמט תוך-ישראלי");

    // Validate Email Address
    let EmailValidationRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!EmailValidationRegex.test(InstructorEmail.value)) errors.push("כתובת האימייל אינה תקינה/ריקה")

    if (errors.length > 0) {

        event.preventDefault();

        let alertMessage = "ישנם מספר בעיות עם הטופס:<br>"
        let errorMessages = []

        for (let i = 0; i < errors.length; i++) {
            const Error_message = errors[i];
            errorMessages.push(`${Error_message}<br>`)
        }

        errorMessages.join("")
        alertMessage = alertMessage + errorMessages

        ShowAlert(`FormErrors`, alertMessage, 'alert-danger', '.alerts')

        FadeRemoveAlert("FormErrors", 5000)
    } else {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        if (ProductID === params["courseID"]) {
            document.querySelector("input[name=ProductID]").value = params["courseID"]
            document.querySelector("input[name=Number]").value = params["CourseCounter"] === undefined ? 1 : Number(params["CourseCounter"])
        } else {
            event.preventDefault();

            FadeRemoveAlert("FormErrors", 5000)

            let alertMessage = "קיימת בעיה עם הקישור, אנא נסו לחזור לעמוד הראשי ושוב לאפיין את הקורס ובמידת הצורך תפנו לעזרה הטכנית"
            ShowAlert(`FormErrors`, alertMessage, 'alert-danger', '.alerts')

            FadeRemoveAlert("FormErrors", 5000)
        }

    }

}

function MoveCourse(Courses, nextCourse) {
    let url = new URL(window.location.href)
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    let CurrentCourseCounter = params["CourseCounter"] === undefined ? 1 : Number(params["CourseCounter"])

    if (CurrentCourseCounter === undefined) {

        url.searchParams.set('CourseCounter', 1);

    } else {

        let futureCourseNumber = nextCourse ? (CurrentCourseCounter+1) : (CurrentCourseCounter-1)

        if (futureCourseNumber > 0 && futureCourseNumber <= Courses) {
            url.searchParams.set('CourseCounter', futureCourseNumber);
        }

    }

    window.location.replace(url)
}

function checkreadonly(isExisting) {
    isExisting = isExisting === "true" ? true : false
    let inputs = Array.from(document.querySelectorAll(".form-control"))
    if (isExisting) {
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            input.setAttribute("readonly", true)
            input.classList.add("disabledInput")
        }
    } else {
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.getAttribute("name") !== "ExpiredCourseTimeDate") {
                input.removeAttribute("readonly")
            }
            input.classList.remove("disabledInput")
        }

        let startDate = moment().subtract(moment().get('hours'), "hours").subtract(moment().get('minutes'), 'minutes').subtract(moment().get('seconds'), "seconds").add(3, "days").toDate()

        $('input[name=ExpiredCourseTimeDate]').datetimepicker({
            format: "dd/mm/yyyy hh:ii",
            startDate: startDate,
            todayBtn: "linked",
            clearBtn: true,
            language: "he",
            daysOfWeekDisabled: "6",
            showMeridian: 1,
            autoclose: true,
            todayHighlight: true,
            toggleActive: true,
        });
    }
}