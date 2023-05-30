$(document).ready(async () => {
  try {
    const res = await fetch("/properties", {
      method: "GET",
    });

    const data = await res.json();

    let Properties = [];

    if (data.status == "Success") {
      Properties = data.Properties;

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
                    <p class="card-text text-decoration-none dark-color">
                    ${property?.propertyLocation}
                    </p>
                    <p class=" text-decoration-none dark-color">
                    ${property?.price}
                    </p>
                </div>
            </a>
            `;
          $("#properties-wrapper").append(div);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});
