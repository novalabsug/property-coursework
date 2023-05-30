$("#add-new-property").submit(async (event) => {
  event.preventDefault();

  const propertyName = event.target.propertyName.value;
  const propertyType = event.target.propertyType.value;
  const propertyLocation = event.target.propertyLocation.value;
  const bedrooms = event.target.bedrooms.value;
  const bathrooms = event.target.bathrooms.value;
  const map = event.target.map.value;
  const cost = event.target.cost.value;
  let Images = event.target.photos.files;

  displayPreviewData({
    propertyLocation,
    propertyName,
    propertyType,
    bedrooms,
    bathrooms,
    map,
    cost,
    Images,
  });
});

// display form data on preview form
function displayPreviewData(data) {
  $("#preview-property-body").html(`
        <div class="py-1 px-3">
            <div class="row g-2 mb-3 align-items-center">
                <div class="col-6">
                    <div class="py-2">
                        <h3 class="fs-6">Property Name</h3>
                        <p class="fs-5 my-1">${data?.propertyName}</p>
                    </div>
                    <div class="py-2">
                        <h3 class="fs-6">Property Location</h3>
                        <p class="fs-5 my-1">${data?.propertyLocation}</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="py-2">
                        <h3 class="fs-6">Property Type</h3>
                        <p class="fs-5 my-1">${data?.propertyType}</p>
                    </div>
                    <div class="py-2">
                        <h3 class="fs-6">Bedrooms</h3>
                        <p class="fs-5 my-1">${data?.bedrooms}</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="py-2">
                        <h3 class="fs-6">Bathrooms</h3>
                        <p class="fs-5 my-1">${data?.bathrooms}</p>
                    </div>
                    <div class="py-2">
                        <h3 class="fs-6">Poperty map link</h3>
                        <p class="fs-5 my-1">${data?.map}</p>
                    </div>
                </div>
                <div class="col-6">
                    <div class="py-2">
                        <h3 class="fs-6">Property price</h3>
                        <p class="fs-5 my-1">${data?.cost}</p>
                    </div>
                </div>
            </div>
            <div class="row g-2 py-3">
            <h3 class="fs-6">Property images</h3>
                ${Array.from(
                  { length: data?.Images?.length ? data?.Images?.length : 0 },
                  (value, index) =>
                    `<div class="col-4"><p class="fs-5 my-1">${data?.Images[index]?.name}</p></div>`
                )}
            </div>
        </div>
    `);
}

$("#confirm-preview-form").click(async () => {
  const form = $("#add-new-property");
  const NewFormData = new FormData(form[0]);
  NewFormData.append(
    "userId",
    LoggedInUser?.userId ? LoggedInUser?.userId : null
  );

  try {
    const res = await fetch("/property/new", {
      method: "POST",
      body: NewFormData,
    });

    const data = await res.json();

    if (data.status == "Success") {
      $("#preview-property-body").html(`
            <h4 class="text-center fs-5 text-success">Successfully created a new property</h4>
        `);

      // redirect user to homepage
      setTimeout(() => {
        $("#preview-property-body").html("");
        window.location.href = "/";
      }, 4000);
    }

    if (data?.Error) {
      // display success message using jquery
      $("#preview-property-body").html(`
        <h4 class="text-center fs-5 text-danger">${data?.Error}</h4>
      `);
    }
  } catch (error) {}
});
