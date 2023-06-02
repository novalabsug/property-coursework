$(document).ready(async () => {
  LoggedInUser?.accountType == "landlord"
    ? fetchLandlordProperties()
    : fetchAllProperties();

  fetchLeasedProperties();

  LoggedInUser?.accountType == "tenant"
    ? $("#leased-properties-container").html(`
  <h3 class="fs-3">Leased properties</h3>
      <div
        class="row row-cols-1 row-cols-md-3 g-4"
        id="leased-properties-wrapper"
      ></div>
  `)
    : $("#leased-properties-container").html(``);

  $("#page-title").html(
    LoggedInUser?.accountType == "landlord"
      ? `
        <div class="p-2">
          <div class="container">
            <h3 class="fs-3">My Properties</h3>
          </div>
        </div>
      `
      : `
        <div class="p-2">
          <div class="container d-flex justify-content-between">
            <h3 class="fs-3">Available properties</h3>
          </div>
        </div>
      `
  );
});

async function fetchLandlordProperties() {
  try {
    const res = await fetch(`/properties/${LoggedInUser?.userId}`, {
      method: "GET",
    });

    const data = await res.json();

    let Properties = [];

    if (data.status == "Success") {
      Properties = data?.Properties;

      if (Properties.length > 0) {
        for (const property of Properties) {
          const div = document.createElement("div");
          div.className = "col";
          div.innerHTML = `
            <a href="property.html?id=${property?.propertyID}" class="card text-decoration-none">
                <img src="upload/${property?.image}" class="card-img-top" alt="" />
                <div class="card-body">
                  <h5 class="card-title text-decoration-none primary-color">
                  ${property?.bedrooms} Bedroom ${property?.propertyType}
                  </h5>
                  <div class="d-flex">
                    <p class="card-text text-decoration-none dark-color">
                    ${property?.propertyLocation}
                    </p>
                    <p class=" mx-3 text-decoration-none primary-color">
                    UGX ${property?.price}
                    </p>
                  </div>
                </div>
            </a>
            `;
          $("#properties-wrapper").append(div);
        }
      } else {
        $("#properties-wrapper").html(`
          <div class="py-5">
            <p class="text-center fs-3">No properties created yet</p>
          </div>
        `);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function fetchAllProperties() {
  try {
    const res = await fetch("/all/properties", {
      method: "GET",
    });

    const data = await res.json();

    let Properties = [];

    if (data.status == "Success") {
      Properties = data.Properties;

      if (Properties.length > 0) {
        for (const property of Properties) {
          if (!property?.leased) {
            const div = document.createElement("div");
            div.className = "col";
            div.innerHTML = `
              <a href="property.html?id=${property?.propertyID}" class="card text-decoration-none">
                  <img src="upload/${property?.image}" class="card-img-top" alt="" />
                  <div class="card-body">
                    <h5 class="card-title text-decoration-none primary-color">
                    ${property?.bedrooms} Bedroom ${property?.propertyType}
                    </h5>
                    <div class="d-flex">
                      <p class="card-text text-decoration-none dark-color">
                      ${property?.propertyLocation}
                      </p>
                      <p class=" mx-3 text-decoration-none primary-color">
                      UGX ${property?.price}
                      </p>
                    </div>
                  </div>
              </a>
              `;
            $("#properties-wrapper").append(div);
          }
        }
      } else {
        $("#properties-wrapper").html(`
          <div class="py-5">
            <p class="text-center fs-2">Welcome to my properties website</p>
          </div>
        `);
      }
    }
  } catch (error) {}
}

async function fetchLeasedProperties() {
  try {
    const res = await fetch(
      `/properties/leased/${
        LoggedInUser?.userId ? LoggedInUser?.userId : null
      }`,
      {
        method: "GET",
      }
    );

    const data = await res.json();

    let Properties = [];

    if (data.status == "Success") {
      Properties = data?.LeasedProperties;

      if (Properties.length > 0) {
        for (const property of Properties) {
          const div = document.createElement("div");
          div.className = "col";
          div.innerHTML = `
            <a href="property.html?id=${property?.propertyID}" class="card text-decoration-none">
                <img src="upload/${property?.image}" class="card-img-top" alt="" />
                <div class="card-body">
                  <h5 class="card-title text-decoration-none primary-color">
                  ${property?.bedrooms} Bedroom ${property?.propertyType}
                  </h5>
                  <div class="d-flex">
                    <p class="card-text text-decoration-none dark-color">
                    ${property?.propertyLocation}
                    </p>
                    <p class=" mx-3 text-decoration-none primary-color">
                    UGX ${property?.price}
                    </p>
                  </div>
                </div>
            </a>
            `;
          $("#leased-properties-wrapper").append(div);
        }
      } else {
        $("#leased-properties-wrapper").html(`
          <div class="py-5">
            <p class="text-center fs-3">You dont have any leased properties</p>
          </div>
        `);
      }
    } else {
      $("#leased-properties-wrapper").html(`
        <div class="py-5">
          <p class="text-center fs-3">You dont have any leased properties</p>
        </div>
      `);
    }
  } catch (error) {
    $("#leased-properties-wrapper").html(`
        <div class="py-5">
          <p class="text-center fs-3">You dont have any leased properties</p>
        </div>
      `);
  }
}
