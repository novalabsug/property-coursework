$("#register-form").submit(async (event) => {
  event.preventDefault();

  const name = event.target.fullname.value;
  const username = event.target.username.value;
  const email = event.target.email.value;
  const accountType = event.target.accountType.value;
  const password = event.target.password.value;

  try {
    const res = await fetch("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        username,
        email,
        accountType,
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
      $("#register-form-msg").html(`
        <h4 class="text-center fs-5 text-success">Successfully logged in as ${User[0]?.username}</h4>
      `);

      // redirect user to homepage
      setTimeout(() => {
        $("#register-form-msg").html("");
        window.location.href = "/";
      }, 4000);
    }
  } catch (error) {
    console.log(error);
  }
});
