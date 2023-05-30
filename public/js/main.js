// check if user is logged in
const UserLocal = localStorage.getItem("propertyUser");
let LoggedInUser = "";

if (UserLocal) LoggedInUser = JSON.parse(UserLocal);

if (LoggedInUser?.isLoggedIn) {
  $("#login-container").html(`
    <button class="p-1 px-3 btn bg-body border-dark" id="logout-btn">Log out, ${LoggedInUser?.username}</button>
`);
} else {
  $("#login-container").html(`
    <a href="signin.html">
        <button class="p-1 px-3 btn bg-body border-dark">Sign In</button>
    </a>
`);
}

// log out user
$("#logout-btn").click((e) => {
  localStorage.setItem("propertyUser", "");
  window.location.href = "/";
});

// handle displaying the create property element
if (LoggedInUser?.accountType) {
  if (LoggedInUser?.accountType == "landlord") {
    $("#create-property-container").html(`
      <div class="d-flex justify-content-end">
        <div class="p-2 px-3">
          <a class="p-1 px-3 btn bg-body border-dark" data-bs-toggle="modal" href="#createPropertyForm" role="button">
            <i class="fa fa-plus fs-5 primary-color"></i>
            Add new property
          </a>
        </div>
      </div>
    `);
  }
}
