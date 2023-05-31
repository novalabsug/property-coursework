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
        accountType: LoggedInUser?.accountType ? LoggedInUser?.accountType : "",
        userId: LoggedInUser?.userId ? LoggedInUser?.userId : "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    let Property = [];
    let PropertyImages = [];
    let PropertyLikes = [];
    let PropertyDislikes = [];
    let Comments = [];

    if (data.status == "Success") {
      Property = data.Property;
      PropertyImages = data?.PropertyImages;
      PropertyLikes = data?.Likes ? data?.Likes : 0;
      PropertyDislikes = data?.Dislikes ? data?.Dislikes : 0;
      Comments = data?.Comments ? data?.Comments : [];
    }

    console.log(Comments);

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
                            <p class="fs-6">${
                              PropertyLikes.length > 0
                                ? PropertyLikes[0].likes
                                : PropertyLikes.length
                            }</p>
                                <p class="mx-2">Likes</p>
                            </a>
                        </div>
                        <div>
                            <a
                            class="px-3 text-decoration-none dark-color d-flex mx-4"
                            >
                            <p class="fs-6">${
                              PropertyDislikes.length > 0
                                ? PropertyDislikes[0].dislikes
                                : PropertyDislikes.length
                            }</p>
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
                    : ``
                }
                ${
                  LoggedInUser?.accountType == "tenant"
                    ? `
                <div class="py-2">
                    <div class="d-flex">
                        <div class="p-2 px-3">
                            <button class="p-1 px-3 btn btn-success" id="like-property-btn" data-target="${Property[0]?.propertyID}">
                            <i class="fa-solid fa-thumbs-up fs-5 text-light"></i>
                            Like
                            </button>
                        </div>
                        <div class="p-2 px-3">
                            <button
                            class="p-1 px-3 btn btn-danger"
                            id="dislike-property-btn"
                            data-target="${Property[0]?.propertyID}"
                            >
                            <i class="fa-solid fa-thumbs-down fs-5 text-light"></i>
                            Dislike
                            </button>
                        </div>
                    </div>
                </div>
                `
                    : ``
                }
            </div>
        </div>
        ${
          LoggedInUser?.accountType == "tenant"
            ? `
                <div class="py-3">
                    <div class="d-flex">
                        <div class="m-auto w-50">
                            <form id="comment-form">
                                <div id="comment-message-form">
                                </div>
                                <div class="py-2">
                                    <p class="fs-5">Leave a comment</p>
                                </div>
                                <input type="text" name="propertyID" value="${
                                  Property[0]?.propertyID
                                    ? Property[0]?.propertyID
                                    : ""
                                }" hidden />
                                <div class="mb-3">
                                    <textarea
                                    class="form-control"
                                    id="comment"
                                    aria-describedby="comment"
                                    placeholder="Your comment"
                                    name="comment"
                                    rows="3"
                                    ></textarea>
                                </div>
                                <div class="py-1">
                                  <button
                                    class="btn btn-primary"
                                    type="submit"
                                  >
                                    Save Comment
                                  </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
          `
            : ``
        }
        ${
          LoggedInUser?.accountType
            ? `
                <div class="py-3">
                    <h4 class="fs-4">Comments</h4>
                    ${
                      Comments?.length
                        ? Comments.length > 0
                          ? `<div class="d-flex py-3 flex-wrap overflow-auto" style="height: 200px;">
                            ${Comments.map(
                              (comment, index) => `
                                <div class="w-25 mx-1 my-2 border-1 border-dark rounded-3">
                                    <p class="fs-6">${comment.comment}</p>
                                    <h4 class="fs-6">${comment.username}</h4>
                                </div>
                                `
                            )}
                        </div>
                        `
                          : `
                            <div class="py-3">
                                <p class="text-center fs-5">
                                No comments yet
                                </p>
                            </div>
                        `
                        : `
                        <div class="py-3">
                            <p class="text-center fs-5">
                                No comments yet
                            </p>
                        </div>
                        `
                    }
                </div>
              `
            : ``
        }
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

      $("#comment-form").submit(async (event) => {
        event.preventDefault();

        const comment = event.target.comment.value;
        const ID = event.target.propertyID.value;

        try {
          const res = await fetch("/property/comment", {
            method: "POST",
            body: JSON.stringify({
              comment,
              propertyID: ID,
              userId: LoggedInUser?.userId ? LoggedInUser?.userId : "",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (data.status == "Success") {
            $("#comment-message-form").html(`
                <div class="py-2">
                  <p class="text-center fs-5 text-success">Successfully added comment</p>
                </div>
              `);
            location.reload();
          } else {
            $("#comment-message-form").html(`
              <div class="py-2">
                <p class="text-center fs-5 text-danger">${data.Error}</p>
              </div>
            `);
          }
        } catch (error) {
          console.log(error);
        }
      });

      // handle adding property likes
      $("#like-property-btn")
        .ready()
        .click(async (event) => {
          const ID = event.target.getAttribute("data-target");

          const res = await fetch("/property/like", {
            method: "POST",
            body: JSON.stringify({
              propertyID: ID,
              userId: LoggedInUser?.userId ? LoggedInUser?.userId : "",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (data.status == "Success") {
            window.location.reload();
          }
        });

      // handle adding property dislikes
      $("#dislike-property-btn")
        .ready()
        .click(async (event) => {
          const ID = event.target.getAttribute("data-target");

          const res = await fetch("/property/dislike", {
            method: "POST",
            body: JSON.stringify({
              propertyID: ID,
              userId: LoggedInUser?.userId ? LoggedInUser?.userId : "",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (data.status == "Success") {
            window.location.reload();
          }
        });

      // handle property delete
      $("#delete-property-btn")
        .ready()
        .click(async (event) => {
          const ID = event.target.getAttribute("data-target");

          const res = await fetch("/property/delete", {
            method: "POST",
            body: JSON.stringify({
              propertyID: ID,
              userId: LoggedInUser?.userId ? LoggedInUser?.userId : "",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (data.status == "Success") {
            data?.message
              ? $("#property-message-nav").html(`
                <p class="fs-5 my-3 text-center text-danger">${data?.message}</p>
            `)
              : $("#property-message-nav").html(`
                <p class="fs-5 my-3 text-center text-danger">Property has been flagged for deletion. It will be deleted on admin approval</p>
            `);

            setTimeout(() => {
              $("#property-message-nav").html("");
            }, 6000);
          } else {
            $("#property-message-nav").html("");
          }
        });

      // handle update form
      $("#update-property-form").submit(async (event) => {
        event.preventDefault();

        const UpdateForm = new FormData(event.target);

        let PropertyId = Property[0]?.propertyID ? Property[0]?.propertyID : "";

        UpdateForm.append("propertyID", PropertyId.toString());

        UpdateForm.append(
          "userId",
          LoggedInUser?.userId ? LoggedInUser?.userId : ""
        );

        try {
          const res = await fetch("/property/update", {
            method: "POST",
            body: UpdateForm,
          });

          const data = await res.json();

          console.log(data);

          if (data.status == "Success") {
            $("#property-message-nav").html(`
                <p class="fs-5 my-3 text-center text-danger">Property has been flagged for update. It will be updated on admin approval</p>
            `);

            setTimeout(() => {
              $("#property-message-nav").html("");
            }, 6000);
          } else {
            $("#property-message-nav").html("");
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
  } catch (error) {
    console.log(error);
    $("#property-message-nav").html("");
  }
});
