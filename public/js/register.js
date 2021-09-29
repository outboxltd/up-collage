const form = document.getElementById("registerform");

form.addEventListener("submit", function (event) {

  let isFine = OnSubmit(form.elements);
  console.log(isFine);
  if (isFine !== true) {
    event.preventDefault();
  }


});

const OnSubmit = (formElements) => {
  formElements = Array.from(formElements)
  const data = {}

  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i];
    if (element.name !== "") data[element.name] = element.value
  }

  let Validations = ValidateFields(data)

  return Validations
};

const ValidateFields = (data) => {
  /*  -- Validations -

   * Check if all fields are empty
   * FullName has a space(means that its a full name)
   * Validate PhoneNumber
   * Validate Email(besides browser)
   * Check if password's length is fine(at least 6characters)
  */

  let errors = [];

  // Check if all fields are empty
  if (Object.values(data).includes("")) errors.push("FIELDS_EMPTY");

  // Check if FullName has a space
  if (!data["FullName"].includes(" ")) errors.push("PARTIAL_FULLNAME");

  // Validate Phone Number
  let PhoneValidationRegex = /^0(5[^7]|[2-4]|[8-9]|7[0-9])[0-9]{7}$/;
  if (!PhoneValidationRegex.test(data["PhoneNumber"])) errors.push("PHONE_INVALID");

  // Validate Email Address
  let EmailValidationRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!EmailValidationRegex.test(data["EmailAddress"])) errors.push("EMAIL_INVALID")

  // Check if password's length is fine
  if (data["Password"].length < 6 || data["Password2"].length < 6 ) errors.push("SHORT_PASSWORD");

    // Check if 2 passwords are equal
    if (data["Password"] !== data["Password2"]) errors.push("PASSWORDS_AINT_SAME");

  console.log(errors);

  if (errors.length > 0) {
    return errors;
    // return false;
  } else {
    return true;
  }
}