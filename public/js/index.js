$(document).ready(async () => {
  LoggedInUser?.accountType == "landlord"
    ? fetchLandlordProperties()
    : LoggedInUser?.accountType == "admin"
    ? fetchAdminProperties()
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
      : LoggedInUser?.accountType == "admin"
      ? ``
      : `
      <div class="p-2">
        <div class="container d-flex justify-content-between">
          <h3 class="fs-3">Available properties</h3>
        </div>
      </div>
    `
  );
});

async function fetchAdminProperties() {
  console.log("called");
  try {
    const res = await fetch(`/properties/admin/${LoggedInUser?.userId}`, {
      method: "GET",
    });

    const data = await res.json();

    let PendingProperties = [];
    let PendingPropertiesForDelete = [];
    let PendingPropertiesForUpdate = [];

    if (data.status == "Success") {
      PendingProperties = data?.PendingProperties;
      PendingPropertiesForDelete = data?.PendingPropertyForDelete;
      PendingPropertiesForUpdate = data?.PendingPropertyForUpdate;

      $("#properties-container").html(`
        <div class="py-3">
          <h3 class="fs-4">New Properties for approval</h3>
          ${
            PendingProperties.length > 0
              ? `
            <div class="row row-cols-1 row-cols-md-3 g-4">
              ${PendingProperties.map(
                (property, index) =>
                  `
                  <div class="col">
                    <a href="property.html?id=${property?.propertyID}&action=approval&tableID=${property?.propertyID}" class="card text-decoration-none">
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
                  </div>
                `
              )}
            </div>
          `
              : `
            <div class="py-3">
              <p class="fs-5">No properties for approval</p>
            </div>
          `
          }
        </div>
        <div class="py-3">
          <h3 class="fs-4">Properties for Deletion</h3>
          ${
            PendingPropertiesForDelete.length > 0
              ? `
            <div class="row row-cols-1 row-cols-md-3 g-4">
              ${PendingPropertiesForDelete.map(
                (property, index) =>
                  `
                  <div class="col">
                    <a href="property.html?id=${property?.propertyID}&action=delete&tableID=${property?.propertyForDeleteId}" class="card text-decoration-none">
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
                  </div>
                `
              )}
            </div>
          `
              : `
            <div class="py-3">
              <p class="fs-5">No properties for approval</p>
            </div>
          `
          }
        </div>
        <div class="py-3">
          <h3 class="fs-4">Properties for update</h3>
          ${
            PendingPropertiesForUpdate.length > 0
              ? `
            <div class="row row-cols-1 row-cols-md-3 g-4">
              ${PendingPropertiesForUpdate.map(
                (property, index) =>
                  `
                  <div class="col">
                    <div class="card">
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
                      <div class="card-footer">
                        <div class="py-2">
                          <button class="p-1 px-3 btn btn-primary" id="approve-action-btn" data-tableID="${property?.propertyForUpdateId}" data-action="update">
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `
              )}
            </div>
          `
              : `
            <div class="py-3">
              <p class="fs-5">No properties for approval</p>
            </div>
          `
          }
          </div>
      `);

      if (PendingProperties.length > 0) {
        for (const property of PendingProperties) {
          const div = document.createElement("div");
          div.className = "col";
          div.innerHTML = `
            
            `;
        }
      } else {
        $("#properties-wrapper").html(`
          <div class="py-5">
            <p class="text-center fs-3">No properties created yet</p>
          </div>
        `);
      }

      $("#approve-action-btn").click(async (event) => {
        const actionType = event.target.getAttribute("data-action");
        const tableID = event.target.getAttribute("data-tableID");

        try {
          const res = await fetch("/property/action", {
            method: "POST",
            body: JSON.stringify({
              actionType,
              tableID,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (data?.status == "Success") {
            location.assign("/");
          }
        } catch (error) {}
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function fetchLandlordProperties() {
  try {
    const res = await fetch(`/properties/${LoggedInUser?.userId}`, {
      method: "GET",
    });

    const data = await res.json();

    console.log(data);

    let PendingProperties = [];
    let ApprovedProperties = [];

    if (data.status == "Success") {
      ApprovedProperties = data?.ApprovedProperties;
      PendingProperties = data?.PendingProperties;

      console.log({ ApprovedProperties, PendingProperties });

      const approvedDiv = document.createElement("div");
      approvedDiv.className = "py-3";
      approvedDiv.innerHTML = `
          <h3 class="fs-4">Approved properties</h3>
          <div class="row row-cols-1 row-cols-md-3 g-4">
          ${
            ApprovedProperties.length > 0
              ? ApprovedProperties.map(
                  (property, index) =>
                    `
                <div class="col">
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
                </div>
              `
                )
              : `
            <div class="py-2">
              <p class="text-center fs-3">No approved properties</p>
            </div>
          `
          }
          </div>
        `;

      $("#properties-container").append(approvedDiv);

      const pendingDiv = document.createElement("div");
      pendingDiv.className = "py-3";
      pendingDiv.innerHTML = `
          <h3 class="fs-4">Pending properties</h3>
          <div class="row row-cols-1 row-cols-md-3 g-4">
          ${
            PendingProperties.length > 0
              ? PendingProperties.map(
                  (property, index) =>
                    `
                <div class="col">
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
                </div>
              `
                )
              : `
            <div class="py-2">
              <p class="text-center fs-3">No approved properties</p>
            </div>
          `
          }
          </div>
        `;

      $("#properties-container").append(pendingDiv);
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
