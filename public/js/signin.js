$("#signin-form").submit(async (event) => {
  event.preventDefault();

  const username = event.target.username.value;
  const password = event.target.password.value;

  // check if user already logged in
  if (LoggedInUser?.username == username) {
    // display success message using jquery
    $("#signin-form-msg").html(`
    <h4 class="text-center fs-5 text-danger">User ${User[0]?.username}, already logged in</h4>
  `);

    // redirect user to homepage
    setTimeout(() => {
      $("#signin-form-msg").html("");
      window.location.href = "/";
    }, 4000);

    return;
  }

  try {
    const res = await fetch("/signin", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    let User = [];

    if (data.status == "Success") {
      User = data.User;

      // store user information in localstorage
      localStorage.setItem(
        "propertyUser",
        JSON.stringify({ ...User[0], isLoggedIn: true })
      );

      // display success message using jquery
      $("#signin-form-msg").html(`
          <h4 class="text-center fs-5 text-success">Successfully logged in as ${User[0]?.username}</h4>
        `);

      // redirect user to homepage
      setTimeout(() => {
        $("#signin-form-msg").html("");
        window.location.href = "/";
      }, 4000);
    }

    if (data?.Error) {
      // display success message using jquery
      $("#signin-form-msg").html(`
      <h4 class="text-center fs-5 text-danger">${data?.Error}</h4>
    `);

      // redirect user to homepage
      setTimeout(() => {
        $("#signin-form-msg").html("");
      }, 4000);
    }
  } catch (error) {
    console.log(error);
  }
});
