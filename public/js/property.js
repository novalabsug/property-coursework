// // handle displaying the property details nav element
// if (LoggedInUser?.accountType) {
//   if (LoggedInUser?.accountType == "landlord") {
//     $("#property-container-nav").html(`
//         <div class="d-flex justify-content-end">
//           <div class="p-2 px-3">
//             <a class="p-1 px-3 btn bg-body border-dark" data-bs-toggle="modal" href="#editPropertyForm" role="button">
//               <i class="fa fa-edit fs-5 primary-color"></i>
//               Edit property
//             </a>
//           </div>
//           <div class="p-2 px-3">
//             <button class="p-1 px-3 btn btn-danger" id="delete-property-btn">
//               <i class="fa-solid fa-trash fs-5 text-light"></i>
//               Delete property
//             </button>
//           </div>
//         </div>
//       `);
//   }
// }

// fetch property details
$(document).ready(async () => {
  const propertyID = new URLSearchParams(window.location.search).get("id");

  try {
    const res = await fetch("/property", {
      method: "POST",
      body: JSON.stringify({
        propertyID,
        userId: LoggedInUser?.userId ? LoggedInUser?.userId : "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    console.log(data);

    let Property = [];
    let PropertyImages = [];

    if (data.status == "Success") {
      Property = data.Property;
      PropertyImages = data.PropertyImages;
    }

    if (Property.length > 0) {
      $("#property-container").html(`
        <div class="d-flex py-3">
            <div class="w-50">
                <div>
                    <img src="upload/${
                      PropertyImages[0].image
                    }" class="w-100" alt="" srcset="" />
                </div>
                <div class="py-3">
                    <div class="d-flex">
                        <div >
                            <a
                            class="px-3 text-decoration-none dark-color d-flex"
                            >
                            <p class="fs-6">3</p>
                                <p class="mx-2">Likes</p>
                            </a>
                        </div>
                        <div>
                            <a
                            class="px-3 text-decoration-none dark-color d-flex mx-4"
                            >
                            <p class="fs-6">6</p>
                                <p class="mx-2">Dislikes</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-50 px-3">
                <h4 class="fs-3 text-capitalize">${
                  Property[0]?.propertyName
                }</h4>
                <p class="fs-6">${Property[0]?.propertyType}</p>
                <h3 class="fs-4 primary-color">UGX ${Property[0]?.price}</h3>
                <div class="d-flex">
                    <p class="fs-6">${Property[0]?.propertyLocation}</p>
                    <a href="${
                      Property[0]?.map
                    }" class="text-decoration-none mx-3 dark-color">
                    <p class="fs-6">Property map link</p>
                    </a>
                </div>
                <div class="d-flex">
                    <p class="fs-6">${Property[0]?.bedrooms} Bedrooms</p>
                    <p class="fs-6 mx-3">${Property[0]?.bathrooms} Bathrooms</p>
                </div>
                <div class="py-2">
                    <p class="fs-6">
                    ${Property[0]?.propertyDescription}
                    </p>
                </div>
                ${
                  LoggedInUser?.accountType == "landlord"
                    ? `
                    <div class="py-2">
                        <div class="d-flex">
                            <div class="p-2 px-3">
                                <a
                                class="p-1 px-3 btn bg-body border-dark"
                                data-bs-toggle="modal"
                                href="#updatePropertyForm"
                                role="button"
                                >
                                <i class="fa fa-edit fs-5 primary-color"></i>
                                Edit property
                                </a>
                            </div>
                            <div class="p-2 px-3">
                                <button
                                class="p-1 px-3 btn btn-danger"
                                id="delete-property-btn"
                                data-target="${Property[0]?.propertyID}"
                                >
                                <i class="fa-solid fa-trash fs-5 text-light"></i>
                                Delete property
                                </button>
                            </div>
                        </div>
                    </div>
                `
                    : `
                    <div class="py-2">
                        <div class="d-flex">
                            <div class="p-2 px-3">
                                <button class="p-1 px-3 btn btn-success" id="like-property-btn">
                                <i class="fa-solid fa-thumbs-up fs-5 text-light"></i>
                                Like
                                0
                                </button>
                            </div>
                            <div class="p-2 px-3">
                                <button
                                class="p-1 px-3 btn btn-danger"
                                id="dislike-property-btn"
                                >
                                <i class="fa-solid fa-thumbs-down fs-5 text-light"></i>
                                Dislike
                                0
                                </button>
                            </div>
                        </div>
                    </div>
                `
                }
            </div>
        </div>
        <div class="py-3">
            <h4 class="fs-4">Comments</h4>
            <div class="d-flex py-3 flex-wrap overflow-auto" style="height: 200px;">
                <div class="w-25 mx-1 my-2 border-1 border-dark rounded-3">
                    <p class="fs-6">oi asuyasuyd ysaudyusadyusay duysadu ysaud yuasydu sya</p>
                    <h4 class="fs-6">Tom Someone</h4>
                </div>
                <div class="w-25 mx-1 my-2 border-1 border-dark rounded-3">
                    <p class="fs-6">oi asuyasuyd ysaudyusadyusay duysadu ysaud yuasydu sya</p>
                    <h4 class="fs-6">Tom Someone</h4>
                </div>
                <div class="w-25 mx-1 my-2 border-1 border-dark rounded-3">
                    <p class="fs-6">oi asuyasuyd ysaudyusadyusay duysadu ysaud yuasydu sya</p>
                    <h4 class="fs-6">Tom Someone</h4>
                </div>
                <div class="w-25 mx-1 my-2 border-1 border-dark rounded-3">
                    <p class="fs-6">oi asuyasuyd ysaudyusadyusay duysadu ysaud yuasydu sya</p>
                    <h4 class="fs-6">Tom Someone</h4>
                </div>
                <div class="w-25 mx-1 my-2 border-1 border-dark rounded-3">
                    <p class="fs-6">oi asuyasuyd ysaudyusadyusay duysadu ysaud yuasydu sya</p>
                    <h4 class="fs-6">Tom Someone</h4>
                </div>
            </div>
        </div>
        <div class="d-flex py-3">
                ${PropertyImages.map(
                  (image, index) => `
                <div class="w-25 mx-1">
                    <img src="upload/${image.image}" class="w-100" />
                 </div>
                `
                )}
        </div>
        `);
    }

    console.log(Property);
  } catch (error) {
    console.log(error);
  }
});
