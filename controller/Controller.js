import { Errors, TryCatch } from "../utils/utils.js";
import conn from "../connection/conn.js";
import bcrypt from "bcrypt";

export const registerPost = TryCatch(async (req, res) => {
  const { name, username, email, accountType, password } = req.body;

  if (!name || name == "") throw Error("Name is required");
  if (!username || username == "") throw Error("Username is required");
  if (!email || email == "") throw Error("Email is required");
  if (!accountType || accountType == "")
    throw Error("Account type is required");
  if (!password || password == "") throw Error("Password is required");

  // check if username is unique
  conn.query(
    `SELECT * FROM users WHERE username='${username}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }
      if (results) {
        console.log(results);
        if (results.length > 0)
          return res
            .status(400)
            .json({ status: "Error", Error: "Username already exists" });

        bcrypt.hash(password, 10, (err, hash) => {
          if (err)
            return res
              .status(400)
              .json({ status: "Error", Error: "Error occured" });

          conn.query(
            `INSERT INTO users (name, username, accountType, email, password) values ('${name}', '${username}', '${accountType}', '${email}', '${hash}')`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                conn.query(
                  `SELECT userId, name, username, accountType, email FROM users WHERE username='${username}'`,
                  (err, results, fields) => {
                    if (err) {
                      console.log(err);
                      return res
                        .status(400)
                        .json({ status: "Error", Error: "Error occured" });
                    }

                    if (results)
                      return res
                        .status(200)
                        .json({ status: "Success", User: results });
                  }
                );
              }
            }
          );
        });
      }
    }
  );
});

export const signinPost = TryCatch(async (req, res) => {
  const { username, password } = req.body;

  if (!username || username == "") throw Error("Username is required");
  if (!password || password == "") throw Error("Password is required");

  conn.query(
    `SELECT * FROM users WHERE username='${username}'`,
    (err, results, fields) => {
      if (err)
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });

      if (results) {
        if (results.length <= 0)
          return res.status(400).json({
            status: "Error",
            Error: "User not found. Please check your username",
          });

        bcrypt.compare(password, results[0]?.password, (err, result) => {
          if (err)
            return res
              .status(400)
              .json({ status: "Error", Error: "Password is incorrect" });

          res.status(200).json({ status: "Success", User: results });
        });
      }
    }
  );
});

export const createPropertyPost = TryCatch(async (req, res) => {
  const {
    propertyName,
    propertyLocation,
    propertyDescription,
    propertyType,
    bedrooms,
    bathrooms,
    map,
    cost,
    userId,
  } = req.body;

  if (!propertyName || propertyName == "")
    throw Error("Property name is required");
  if (!propertyLocation || propertyLocation == "")
    throw Error("Property location is required");
  if (!propertyDescription || propertyDescription == "")
    throw Error("Property description is required");
  if (!propertyType || propertyType == "")
    throw Error("Property type is required");
  if (!bedrooms || bedrooms == "") throw Error("Bedrooms is required");
  if (!bathrooms || bathrooms == "") throw Error("Bathroomd is required");
  if (!map || map == "") throw Error("Map link is required");
  if (!cost || cost == "") throw Error("Property price is required");

  conn.query(
    `INSERT INTO property (propertyName, propertyType, propertyLocation, propertyDescription, bedrooms, bathrooms, map, price, userId) VALUES ('${propertyName}', '${propertyType}', '${propertyLocation}', '${propertyDescription}', '${bedrooms}', '${bathrooms}', '${map}', '${cost}', '${userId}')`,
    (err, results, fields) => {
      if (err) {
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        conn.query(
          `SELECT * FROM property WHERE propertyName='${propertyName}' AND propertyLocation='${propertyLocation}'`,
          (err, results, fields) => {
            if (err) {
              return res
                .status(400)
                .json({ status: "Error", Error: "Error occured" });
            }

            if (results) {
              if (results.length > 0) {
                for (const image of req.files) {
                  console.log(image);
                  conn.query(
                    `INSERT INTO propertyimages (image, propertyID) VALUES ('${image.filename}', '${results[0].propertyID}')`,
                    (err, results, fields) => {
                      if (err) {
                        console.log(err);
                      }
                    }
                  );
                }

                res.status(200).json({ status: "Success" });
              }
            }
          }
        );
      }
    }
  );
});

export const fetchAllPropertiesGet = TryCatch(async (req, res) => {
  conn.query(
    "SELECT * FROM property WHERE status='approved'",
    (err, results, fields) => {
      let Properties = results;

      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (Properties) {
        if (Properties.length <= 0)
          return res.status(200).json({ status: "Success", Properties });

        Properties.forEach((property, index) => {
          conn.query(
            `SELECT * FROM leasedProperty WHERE propertyID='${property.propertyID}' AND status='active'`,
            (err, LeasedProperty, fields) => {
              if (LeasedProperty) {
                console.log(LeasedProperty);
                property.leased = LeasedProperty?.length > 0 ? true : false;
                conn.query(
                  `SELECT image FROM propertyimages WHERE propertyID = '${property.propertyID}'`,
                  (err, results, fields) => {
                    property.image = results[0].image;

                    if (index == Properties.length - 1)
                      return res
                        .status(200)
                        .json({ status: "Success", Properties });
                  }
                );
              }
            }
          );
        });
      }
    }
  );
});

export const fetchPropertiesGet = TryCatch(async (req, res) => {
  const ID = req.params.id ? req.params.id : null;

  console.log("we are here");

  if (ID === null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `SELECT * FROM property WHERE userId = ${ID} AND status='approved'`,
    (err, results, fields) => {
      let ApprovedProperties = results;

      console.log({ ApprovedProperties });

      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (ApprovedProperties) {
        if (ApprovedProperties.length > 0) {
          for (let property of ApprovedProperties) {
            conn.query(
              `SELECT image FROM propertyimages WHERE propertyID = '${property.propertyID}'`,
              (err, results, fields) => {
                property.image = results[0].image;
                // res.status(200).json({ status: "Success", ApprovedProperties });
              }
            );
          }
        }

        conn.query(
          `SELECT * FROM property WHERE userId = ${ID} AND status='pending'`,
          (err, results, fields) => {
            let PendingProperties = results;

            console.log({ PendingProperties });

            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ status: "Error", Error: "Error occured" });
            }

            if (PendingProperties) {
              for (const property of PendingProperties) {
                property.image = results[0].image;
              }

              // fetch most liked and disliked property
              conn.query(
                `SELECT * FROM property INNER JOIN likedproperty ON property.propertyID = likedproperty.propertyID WHERE property.userId='${ID}'`,
                (err, LikedProperties, fields) => {
                  const LikedProperty = [];
                  if (err) {
                    console.log(err);
                    return res
                      .status(400)
                      .json({ status: "Error", Error: "Error occured" });
                  }

                  if (LikedProperties) {
                    console.log({ LikedProperties });
                    if (LikedProperties.length > 0) {
                      LikedProperty.push(
                        LikedProperties.reduce((prev, curr) => {
                          return prev.likes > curr.likes ? prev : curr;
                        })
                      );
                      conn.query(
                        `SELECT image FROM propertyimages WHERE propertyID=${LikedProperty[0].propertyID}`,
                        (err, images, fields) => {
                          if (err) {
                            console.log(err);
                            return res.status(400).json({
                              status: "Error",
                              Error: "Error occured",
                            });
                          }

                          if (images) {
                            LikedProperty[0].image = images[0].image;
                          }
                        }
                      );
                    }
                    // fetch disliked property
                    conn.query(
                      `SELECT * FROM property INNER JOIN dislikedproperty ON property.propertyID = dislikedproperty.propertyID WHERE property.userId='${ID}'`,
                      (err, DislikedProperties, fields) => {
                        const DislikedProperty = [];
                        if (err) {
                          console.log(err);
                          return res.status(400).json({
                            status: "Error",
                            Error: "Error occured",
                          });
                        }

                        console.log(DislikedProperties);

                        if (DislikedProperties) {
                          if (DislikedProperties.length > 0) {
                            console.log(DislikedProperties);
                            DislikedProperty.push(
                              DislikedProperties.reduce((prev, curr) => {
                                return prev.likes > curr.likes ? prev : curr;
                              })
                            );

                            conn.query(
                              `SELECT image FROM propertyimages WHERE propertyID=${DislikedProperty[0].propertyID}`,
                              (err, images, fields) => {
                                if (err) {
                                  console.log(err);
                                  return res.status(400).json({
                                    status: "Error",
                                    Error: "Error occured",
                                  });
                                }

                                if (images) {
                                  DislikedProperty[0].image = images[0].image;
                                }

                                res.status(200).json({
                                  status: "Success",
                                  ApprovedProperties,
                                  PendingProperties,
                                  LikedProperty,
                                  DislikedProperty,
                                });
                                return;
                              }
                            );
                          } else {
                            console.log("also herreeee");

                            return res.status(200).json({
                              status: "Success",
                              ApprovedProperties,
                              PendingProperties,
                              LikedProperty,
                              DislikedProperty,
                            });
                          }
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

export const fetchPropertyPost = TryCatch(async (req, res) => {
  const { propertyID, userId, accountType } = req.body;

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null) {
    conn.query(
      `SELECT * FROM property INNER JOIN users ON property.userId = users.userID WHERE property.propertyID = ${propertyID}`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (results) {
          if (results.length > 0) {
            const Property = results;
            conn.query(
              `SELECT image FROM propertyimages WHERE propertyID=${Property[0].propertyID}`,
              (err, images, fields) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(400)
                    .json({ status: "Error", Error: "Error occured" });
                }

                if (images) {
                  conn.query(
                    `SELECT likedProperty.likes, users.username FROM likedproperty INNER JOIN users ON likedProperty.userId = users.userId WHERE likedProperty.propertyID = '${Property[0].propertyID}'`,
                    (err, Likes, fields) => {
                      if (err) {
                        console.log(err);
                        return res
                          .status(400)
                          .json({ status: "Error", Error: "Error occured" });
                      }

                      if (Likes) {
                        conn.query(
                          `SELECT dislikedProperty.dislikes, users.username FROM dislikedproperty INNER JOIN users ON dislikedProperty.userId = users.userId WHERE dislikedProperty.propertyID = '${Property[0].propertyID}'`,
                          (err, Dislikes, fields) => {
                            if (err) {
                              console.log(err);
                              return res.status(400).json({
                                status: "Error",
                                Error: "Error occured",
                              });
                            }

                            if (Dislikes) {
                              conn.query(
                                `SELECT comment.commentId, comment.comment, users.username, users.userId FROM comment INNER JOIN users ON comment.userId = users.userId WHERE comment.propertyID = '${Property[0].propertyID}'`,
                                (err, Comments, fields) => {
                                  if (err) {
                                    console.log(err);
                                    return res.status(400).json({
                                      status: "Error",
                                      Error: "Error occured",
                                    });
                                  }

                                  if (Comments) {
                                    res.status(200).json({
                                      status: "Success",
                                      Property,
                                      PropertyImages: images,
                                      Likes,
                                      Dislikes,
                                      Comments,
                                    });
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.status(200).json({ status: "Success", Property: results });
          }
        }
      }
    );

    return;
  }

  accountType == "landlord"
    ? conn.query(
        `SELECT * FROM property WHERE propertyID = ${propertyID} AND userId = ${userId}`,
        (err, Property, fields) => {
          if (err) {
            console.log(err);
            return res
              .status(400)
              .json({ status: "Error", Error: "Error occured" });
          }

          if (Property) {
            if (Property.length > 0) {
              conn.query(
                `SELECT image FROM propertyimages WHERE propertyID=${Property[0].propertyID}`,
                (err, images, fields) => {
                  if (err) {
                    console.log(err);
                    return res
                      .status(400)
                      .json({ status: "Error", Error: "Error occured" });
                  }

                  if (images) {
                    conn.query(
                      `SELECT likedProperty.likes, users.username FROM likedproperty INNER JOIN users ON likedProperty.userId = users.userId WHERE likedProperty.propertyID = '${Property[0].propertyID}'`,
                      (err, Likes, fields) => {
                        if (err) {
                          console.log(err);
                          return res
                            .status(400)
                            .json({ status: "Error", Error: "Error occured" });
                        }

                        if (Likes) {
                          conn.query(
                            `SELECT dislikedProperty.dislikes, users.username FROM dislikedproperty INNER JOIN users ON dislikedProperty.userId = users.userId WHERE dislikedProperty.propertyID = '${Property[0].propertyID}'`,
                            (err, Dislikes, fields) => {
                              if (err) {
                                console.log(err);
                                return res.status(400).json({
                                  status: "Error",
                                  Error: "Error occured",
                                });
                              }

                              if (Dislikes) {
                                conn.query(
                                  `SELECT comment.commentId, comment.comment, users.username, users.userId FROM comment INNER JOIN users ON comment.userId = users.userId WHERE comment.propertyID = '${Property[0].propertyID}'`,
                                  (err, Comments, fields) => {
                                    if (err) {
                                      console.log(err);
                                      return res.status(400).json({
                                        status: "Error",
                                        Error: "Error occured",
                                      });
                                    }

                                    if (Comments) {
                                      conn.query(
                                        `SELECT * FROM leasedproperty WHERE propertyID = '${Property[0].propertyID}' AND status='requested'`,
                                        (err, LeasedProperty, fields) => {
                                          if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                              status: "Error",
                                              Error: "Error occured",
                                            });
                                          }

                                          if (LeasedProperty) {
                                            console.log(LeasedProperty.length);
                                            if (LeasedProperty.length > 0) {
                                              conn.query(
                                                `SELECT name, email FROM users WHERE userId = '${LeasedProperty[0].userId}'`,
                                                (err, user, fields) => {
                                                  if (err) {
                                                    console.log(err);
                                                    return res
                                                      .status(400)
                                                      .json({
                                                        status: "Error",
                                                        Error: "Error occured",
                                                      });
                                                  }

                                                  if (user) {
                                                    res.status(200).json({
                                                      status: "Success",
                                                      Property,
                                                      PropertyImages: images,
                                                      Likes,
                                                      Dislikes,
                                                      Comments,
                                                      LeasedPropertyRequest: {
                                                        leasedPropertyId:
                                                          LeasedProperty[0]
                                                            .leasedPropertyId,
                                                        leaseDuration:
                                                          LeasedProperty[0]
                                                            .duration,
                                                        IsLeased: true,
                                                      },
                                                      User: user[0],
                                                    });
                                                  }
                                                }
                                              );

                                              return;
                                            }
                                            res.status(200).json({
                                              status: "Success",
                                              Property,
                                              PropertyImages: images,
                                              Likes,
                                              Dislikes,
                                              Comments,
                                              LeasedPropertyRequest: {
                                                IsLeased: false,
                                              },
                                            });
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            } else {
              res.status(200).json({ status: "Success", Property });
            }
          }
        }
      )
    : conn.query(
        `SELECT * FROM property INNER JOIN users ON property.userId = users.userID WHERE property.propertyID = ${propertyID}`,
        (err, results, fields) => {
          if (err) {
            console.log(err);
            return res
              .status(400)
              .json({ status: "Error", Error: "Error occured" });
          }

          if (results) {
            if (results.length > 0) {
              const Property = results;
              conn.query(
                `SELECT image FROM propertyimages WHERE propertyID=${Property[0].propertyID}`,
                (err, images, fields) => {
                  if (err) {
                    console.log(err);
                    return res
                      .status(400)
                      .json({ status: "Error", Error: "Error occured" });
                  }

                  if (images) {
                    conn.query(
                      `SELECT likedProperty.likes, users.username FROM likedproperty INNER JOIN users ON likedProperty.userId = users.userId WHERE likedProperty.propertyID = '${Property[0].propertyID}'`,
                      (err, Likes, fields) => {
                        if (err) {
                          console.log(err);
                          return res
                            .status(400)
                            .json({ status: "Error", Error: "Error occured" });
                        }

                        if (Likes) {
                          conn.query(
                            `SELECT dislikedProperty.dislikes, users.username FROM dislikedproperty INNER JOIN users ON dislikedProperty.userId = users.userId WHERE dislikedProperty.propertyID = '${Property[0].propertyID}'`,
                            (err, Dislikes, fields) => {
                              if (err) {
                                console.log(err);
                                return res.status(400).json({
                                  status: "Error",
                                  Error: "Error occured",
                                });
                              }

                              if (Dislikes) {
                                conn.query(
                                  `SELECT comment.commentId, comment.comment, users.username, users.userId FROM comment INNER JOIN users ON comment.userId = users.userId WHERE comment.propertyID = '${Property[0].propertyID}'`,
                                  (err, Comments, fields) => {
                                    if (err) {
                                      console.log(err);
                                      return res.status(400).json({
                                        status: "Error",
                                        Error: "Error occured",
                                      });
                                    }

                                    if (Comments) {
                                      conn.query(
                                        `SELECT * FROM leasedproperty WHERE propertyID='${Property[0].propertyID}'`,
                                        (err, LeasedProperty, fields) => {
                                          if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                              status: "Error",
                                              Error: "Error occured",
                                            });
                                          }

                                          if (LeasedProperty) {
                                            if (LeasedProperty.length > 0)
                                              return res.status(200).json({
                                                status: "Success",
                                                Property,
                                                PropertyImages: images,
                                                Likes,
                                                Dislikes,
                                                Comments,
                                                LeasedProperty:
                                                  LeasedProperty[0]?.status ==
                                                  "active"
                                                    ? true
                                                    : false,
                                              });

                                            res.status(200).json({
                                              status: "Success",
                                              Property,
                                              PropertyImages: images,
                                              Likes,
                                              Dislikes,
                                              Comments,
                                              LeasedProperty: false,
                                            });
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            } else {
              res.status(200).json({ status: "Success", Property: results });
            }
          }
        }
      );
});

export const addPropertyForDeletePost = TryCatch(async (req, res) => {
  const { propertyID, userId } = req.body;

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `SELECT * FROM propertyfordelete WHERE propertyID='${propertyID}' AND userId='${userId}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results.length > 0)
        return res.status(200).json({
          status: "Success",
          message: "Property all ready flagged for deletion",
        });

      conn.query(
        `INSERT INTO propertyfordelete (propertyID, userId) VALUES ('${propertyID}', '${userId}')`,
        (err, results, fields) => {
          if (err) {
            console.log(err);
            return res
              .status(400)
              .json({ status: "Error", Error: "Error occured" });
          }

          if (results) {
            res.status(200).json({
              status: "Success",
            });
          }
        }
      );
    }
  );
});

export const addPropertyForUpdatePost = TryCatch(async (req, res) => {
  const {
    propertyName,
    propertyLocation,
    propertyDescription,
    propertyType,
    bedrooms,
    bathrooms,
    map,
    cost,
    userId,
    propertyID,
  } = req.body;

  console.log(req.body);

  console.log("called hereeee");

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  // check if the property has already been flagged to update

  conn.query(
    `SELECT * FROM propertyforupdate WHERE propertyID='${propertyID}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        if (results.length > 0) {
          console.log("greater");
          conn.query(
            `UPDATE propertyforupdate SET propertyName='${propertyName}', propertyType='${propertyType}', propertyLocation='${propertyLocation}', propertyDescription='${propertyDescription}', bedrooms='${bedrooms}', bathrooms='${bathrooms}', map='${map}', price='${cost}', userId='${userId}' WHERE propertyID='${propertyID}'`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                conn.query(
                  `SELECT * FROM propertyforupdate WHERE propertyID='${propertyID}' AND status='pending'`,
                  (err, propertyForUpdate, fields) => {
                    if (err) {
                      console.log(err);
                      return res
                        .status(400)
                        .json({ status: "Error", Error: "Error occured" });
                    }
                    if (propertyForUpdate.length > 0) {
                      if (req.files?.length > 0) {
                        for (const image of req.files) {
                          conn.query(
                            `DELETE FROM propertyimagesforupdate WHERE propertyID='${
                              propertyForUpdate[
                                parseInt(propertyForUpdate?.length) - 1
                              ].propertyID
                            }' AND status='pending'`,
                            (err, results, fields) => {
                              conn.query(
                                `INSERT INTO propertyimagesforupdate (image, propertyID) VALUES ('${
                                  image.filename
                                }', '${
                                  propertyForUpdate[
                                    parseInt(propertyForUpdate?.length) - 1
                                  ].propertyID
                                }')`,
                                (err, results, fields) => {
                                  if (err) {
                                    console.log(err);
                                  }
                                }
                              );
                            }
                          );
                        }

                        return res.status(200).json({ status: "Success" });
                      }
                      res.status(200).json({ status: "Success" });
                    }
                  }
                );
              }
            }
          );
        } else {
          console.log("not");
          conn.query(
            `INSERT INTO propertyforupdate (propertyID, propertyName, propertyType, propertyLocation, propertyDescription, bedrooms, bathrooms, map, price, userId) VALUES ('${propertyID}', '${propertyName}', '${propertyType}', '${propertyLocation}', '${propertyDescription}', '${bedrooms}', '${bathrooms}', '${map}', '${cost}', '${userId}')`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                conn.query(
                  `SELECT * FROM propertyforupdate WHERE propertyID='${propertyID}' AND status='pending'`,
                  (err, results, fields) => {
                    if (err) {
                      console.log(err);
                      return res
                        .status(400)
                        .json({ status: "Error", Error: "Error occured" });
                    }
                    if (results.length > 0) {
                      if (req.files?.length > 0) {
                        for (const image of req.files) {
                          conn.query(
                            `INSERT INTO propertyimagesforupdate (image, propertyID) VALUES ('${
                              image.filename
                            }', '${
                              results[parseInt(results?.length) - 1].propertyID
                            }')`,
                            (err, results, fields) => {
                              if (err) {
                                console.log(err);
                              }
                            }
                          );
                        }

                        return res.status(200).json({ status: "Success" });
                      }
                      res.status(200).json({ status: "Success" });
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
});

export const createLikePost = TryCatch(async (req, res) => {
  const { userId, propertyID } = req.body;

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `SELECT * FROM likedproperty WHERE propertyID='${propertyID}' AND userId='${userId}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        if (results.length > 0) {
          console.log("here");
          console.log(results[0]);
          conn.query(
            `UPDATE likedproperty SET likes=${
              parseInt(results[0].likes) + 1
            } WHERE likedPropertyId=${results[0].likedPropertyId}`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                res.status(200).json({ status: "Success" });
              }
            }
          );
        } else {
          conn.query(
            `INSERT INTO likedproperty (likes, propertyID, userId) VALUES (1, '${propertyID}', '${userId}')`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                res.status(200).json({ status: "Success" });
              }
            }
          );
        }
      }
    }
  );
});

export const createDislikePost = TryCatch(async (req, res) => {
  const { userId, propertyID } = req.body;

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `SELECT * FROM dislikedproperty WHERE propertyID='${propertyID}' AND userId='${userId}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        if (results.length > 0) {
          conn.query(
            `UPDATE dislikedproperty SET dislikes=${
              parseInt(results[0].dislikes) + 1
            } WHERE dislikedPropertyId=${results[0].dislikedPropertyId}`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                res.status(200).json({ status: "Success" });
              }
            }
          );
        } else {
          conn.query(
            `INSERT INTO dislikedproperty (dislikes, propertyID, userId) VALUES (1, '${propertyID}', '${userId}')`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                res.status(200).json({ status: "Success" });
              }
            }
          );
        }
      }
    }
  );
});

export const createCommentPost = TryCatch(async (req, res) => {
  const { userId, propertyID, comment } = req.body;

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (comment == "" || comment == null)
    return res
      .status(400)
      .json({ status: "Error", Error: "Comment is required" });

  conn.query(
    `INSERT INTO comment (comment, propertyID, userId) VALUES ('${comment}', '${propertyID}', '${userId}')`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        res.status(200).json({ status: "Success" });
      }
    }
  );
});

export const updatePropertyComment = TryCatch(async (req, res) => {
  const { commentId, comment } = req.body;

  if (commentId == "" || commentId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (comment == "" || comment == null)
    return res
      .status(400)
      .json({ status: "Error", Error: "Comment is required" });

  conn.query(
    `UPDATE comment SET comment='${comment}' WHERE commentId='${commentId}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        res.status(200).json({ status: "Success" });
      }
    }
  );
});

export const deletePropertyComment = TryCatch(async (req, res) => {
  const commentId = req.params.id;

  if (commentId == "" || commentId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `DELETE FROM comment WHERE commentId=${commentId}`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        res.status(200).json({ status: "Success" });
      }
    }
  );
});

export const createLeasedPropertyPost = TryCatch(async (req, res) => {
  const { propertyID, userId, duration } = req.body;

  if (propertyID == "" || propertyID == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (duration == "" || duration == null)
    return res
      .status(400)
      .json({ status: "Error", Error: "Duration is required" });

  conn.query(
    `SELECT * FROM leasedproperty WHERE propertyID = '${propertyID}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      console.log(results);

      if (results) {
        if (results[0]?.status == "requested") {
          conn.query(
            `UPDATE leasedproperty SET duration='${duration}' WHERE propertyID=${propertyID} AND status='requested'`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                res.status(200).json({ status: "Success" });
              }
            }
          );
        } else {
          conn.query(
            `INSERT INTO leasedproperty (propertyID, userId, duration, status) VALUES ('${propertyID}', '${userId}', '${duration}', 'requested')`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (results) {
                res.status(200).json({ status: "Success" });
              }
            }
          );
        }
      }
    }
  );
});

export const fetchLeasedProperties = TryCatch(async (req, res) => {
  const userId = req.params.id;

  if (userId == "" || userId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `SELECT * FROM leasedproperty WHERE userId='${userId}' AND status='active'`,
    (err, results, fields) => {
      const LeasedProperties = [];

      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        if (results.length > 0) {
          results.forEach((result, index) => {
            conn.query(
              `SELECT * FROM property WHERE propertyID = '${result.propertyID}'`,
              (err, property, fields) => {
                conn.query(
                  `SELECT image FROM propertyimages WHERE propertyID='${result.propertyID}'`,
                  (err, image, fields) => {
                    if (image) {
                      property[0].image = image[0].image;
                      LeasedProperties.push(property[0]);

                      if (index == results.length - 1) {
                        return res
                          .status(200)
                          .json({ status: "Success", LeasedProperties });
                      }
                    }
                  }
                );
              }
            );
          });
        } else {
          return res.status(200).json({ status: "Success", LeasedProperties });
        }
      }
    }
  );
});

export const updateLeasedPropertStatus = TryCatch(async (req, res) => {
  const { LeasedPropertyId } = req.body;

  if (LeasedPropertyId == "" || LeasedPropertyId == null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `UPDATE leasedproperty SET status='active' WHERE leasedPropertyId='${LeasedPropertyId}'`,
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (results) {
        return res.status(200).json({ status: "Success" });
      }
    }
  );
});

export const fetchAdminPropertiesPost = TryCatch(async (req, res) => {
  const ID = req.params.id ? req.params.id : null;

  if (ID === null)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    "SELECT * FROM property WHERE status='pending'",
    (err, PendingProperties, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (PendingProperties) {
        if (PendingProperties.length > 0) {
          for (const property of PendingProperties) {
            conn.query(
              `SELECT image FROM propertyimages WHERE propertyID='${property.propertyID}'`,
              (err, pendingPropertiesImages, fields) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(400)
                    .json({ status: "Error", Error: "Error occured" });
                }

                if (pendingPropertiesImages) {
                  property.image = pendingPropertiesImages[0].image;
                }
              }
            );
          }
        }
        conn.query(
          "SELECT propertyforupdate.propertyForUpdateId, propertyforupdate.propertyID, property.propertyName FROM propertyforupdate INNER JOIN property ON propertyforupdate.propertyID = property.propertyID WHERE propertyforupdate.status='pending'",
          (err, PendingPropertyForUpdate, fields) => {
            if (err) {
              console.log(err);
              return res
                .status(400)
                .json({ status: "Error", Error: "Error occured" });
            }

            console.log(PendingPropertyForUpdate);

            if (PendingPropertyForUpdate) {
              if (PendingPropertyForUpdate.length > 0) {
                for (const property of PendingPropertyForUpdate) {
                  conn.query(
                    `SELECT image FROM propertyimages WHERE propertyID='${property.propertyID}'`,
                    (err, pendingPropertyForUpdateImages, fields) => {
                      if (pendingPropertyForUpdateImages) {
                        if (err) {
                          console.log(err);
                          return res
                            .status(400)
                            .json({ status: "Error", Error: "Error occured" });
                        }

                        property.image =
                          pendingPropertyForUpdateImages[0].image;
                      }
                    }
                  );
                }
              }
              conn.query(
                "SELECT * FROM propertyfordelete INNER JOIN property ON propertyfordelete.propertyID = property.propertyID WHERE propertyfordelete.status='pending'",
                (err, PendingPropertyForDelete, fields) => {
                  if (err) {
                    console.log(err);
                    return res
                      .status(400)
                      .json({ status: "Error", Error: "Error occured" });
                  }

                  if (PendingPropertyForDelete) {
                    if (PendingPropertyForDelete.length > 0) {
                      PendingPropertyForDelete.forEach((property, index) => {
                        conn.query(
                          `SELECT image FROM propertyimages WHERE propertyID='${property.propertyID}'`,
                          (err, pendingPropertyForDeleteImages, fields) => {
                            if (err) {
                              console.log(err);
                            }
                            if (pendingPropertyForDeleteImages) {
                              property.image =
                                pendingPropertyForDeleteImages[0].image;
                            }
                          }
                        );
                      });
                    }
                    // fetch all approved properties
                    conn.query(
                      "SELECT * FROM property WHERE status='approved'",
                      (err, ApprovedPropertiesArr, fields) => {
                        if (err) {
                          console.log(err);
                          return res
                            .status(400)
                            .json({ status: "Error", Error: "Error occured" });
                        }

                        if (ApprovedPropertiesArr) {
                          // fetch all leased properties
                          conn.query(
                            "SELECT * FROM leasedproperty WHERE status='active'",
                            (err, LeasedPropertiesArr, fields) => {
                              if (err) {
                                console.log(err);
                                return res.status(400).json({
                                  status: "Error",
                                  Error: "Error occured",
                                });
                              }

                              if (LeasedPropertiesArr) {
                                // fetch all landlords
                                conn.query(
                                  "SELECT * FROM users WHERE accountType='landlord'",
                                  (err, LandlordArr, fields) => {
                                    if (err) {
                                      console.log(err);
                                      return res.status(400).json({
                                        status: "Error",
                                        Error: "Error occured",
                                      });
                                    }

                                    if (LandlordArr) {
                                      conn.query(
                                        "SELECT * FROM users WHERE accountType='tenant'",
                                        (err, TenantArr, fields) => {
                                          if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                              status: "Error",
                                              Error: "Error occured",
                                            });
                                          }

                                          if (TenantArr) {
                                            res.status(200).json({
                                              status: "Success",
                                              PendingProperties,
                                              PendingPropertyForDelete,
                                              PendingPropertyForUpdate,
                                              ApprovedProperties:
                                                ApprovedPropertiesArr.length
                                                  ? ApprovedPropertiesArr.length
                                                  : 0,
                                              LeasedProperties:
                                                LeasedPropertiesArr.length
                                                  ? LeasedPropertiesArr.length
                                                  : 0,
                                              Landlords: LandlordArr.length
                                                ? LandlordArr.length
                                                : 0,
                                              Tenants: TenantArr.length
                                                ? TenantArr.length
                                                : 0,
                                            });
                                            return;
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

export const propertyActionPost = TryCatch(async (req, res) => {
  const { actionType, tableID } = req.body;

  if (actionType === null || actionType == "")
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (tableID === null || tableID == "")
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (actionType == "approval") {
    conn.query(
      `UPDATE property SET status='approved' WHERE propertyID='${tableID}'`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (results) {
          res.status(200).json({ status: "Success" });
        }
      }
    );
  }
  if (actionType == "update") {
    conn.query(
      `SELECT * FROM propertyforupdate WHERE propertyForUpdateId='${tableID}'`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (results) {
          conn.query(
            `SELECT * FROM property WHERE propertyID='${results[0].propertyID}'`,
            (err, Property, fields) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });
              }

              if (Property) {
                conn.query(
                  `UPDATE property SET ${
                    results[0].propertyName == "" || !results[0].propertyName
                      ? `propertyName='${Property[0]?.propertyName}',`
                      : `propertyName='${results[0].propertyName}',`
                  } ${
                    results[0].propertyType == "" || !results[0].propertyType
                      ? `propertyType='${Property[0]?.propertyType}',`
                      : `propertyType='${results[0].propertyType}',`
                  } ${
                    results[0].propertyLocation == "" ||
                    !results[0].propertyLocation
                      ? `propertyLocation='${Property[0]?.propertyLocation}',`
                      : `propertyLocation='${results[0].propertyLocation}',`
                  } ${
                    results[0].propertyDescription == "" ||
                    !results[0].propertyDescription
                      ? `propertyDescription='${Property[0]?.propertyDescription}',`
                      : `propertyDescription='${results[0].propertyDescription}',`
                  } ${
                    results[0].bedrooms == 0 ||
                    results[0].bedrooms == "" ||
                    !results[0].bedrooms
                      ? `bedrooms=${Property[0]?.bedrooms},`
                      : `bedrooms='${parseInt(results[0].bedrooms)}',`
                  } ${
                    results[0].bathrooms == 0 ||
                    results[0].bathrooms == "" ||
                    !results[0].bathrooms
                      ? `bathrooms=${Property[0]?.bathrooms},`
                      : `bathrooms='${parseInt(results[0].bathrooms)}',`
                  } ${
                    results[0].map == "" || !results[0].map
                      ? `map='${Property[0]?.map}',`
                      : `map='${results[0].map}',`
                  } ${
                    results[0].price == "" || !results[0].price
                      ? `price=${Property[0]?.price}`
                      : `price=${parseInt(results[0].price)}`
                  } WHERE propertyID='${tableID}'`,
                  (err, results, fields) => {
                    if (err) {
                      console.log(err);
                      return res
                        .status(400)
                        .json({ status: "Error", Error: "Error occured" });
                    }

                    if (results) {
                      conn.query(
                        `UPDATE propertyforupdate SET status='updated' WHERE propertyForUpdateId='${tableID}'`,
                        (err, results, fiedls) => {
                          if (err) {
                            console.log(err);
                            return res.status(400).json({
                              status: "Error",
                              Error: "Error occured",
                            });
                          }

                          if (results) {
                            res.status(200).json({ status: "Success" });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }
  if (actionType == "delete") {
    conn.query(
      `SELECT * FROM propertyfordelete WHERE propertyForDeleteId='${tableID}'`,
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (results) {
          if (results.length > 0) {
            conn.query(
              `DELETE FROM property WHERE propertyID='${results[0].propertyID}'`,
              (err, results, fields) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(400)
                    .json({ status: "Error", Error: "Error occured" });
                }

                if (results) {
                  conn.query(
                    `UPDATE propertyfordelete SET status='deleted' WHERE propertyForDeleteId='${tableID}'`,
                    (err, results, fiedls) => {
                      if (err) {
                        console.log(err);
                        return res.status(400).json({
                          status: "Error",
                          Error: "Error occured",
                        });
                      }

                      if (results) {
                        res.status(200).json({ status: "Success" });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  }
});

export const fetchSortedProperties = TryCatch(async (req, res) => {
  const sortBy = req.params.id ? req.params.id : "";

  if (sortBy == "" || !sortBy)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  if (sortBy == "datePosted") {
    conn.query(
      `SELECT * FROM property WHERE status='approved' ORDER BY createdOn`,
      (err, Properties, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (Properties) {
          if (Properties.length <= 0)
            return res.status(200).json({ status: "Success", Properties });

          Properties.forEach((property, index) => {
            conn.query(
              `SELECT image FROM propertyimages WHERE propertyID = '${property.propertyID}'`,
              (err, results, fields) => {
                property.image = results[0].image;

                if (index == Properties.length - 1)
                  return res
                    .status(200)
                    .json({ status: "Success", Properties });
              }
            );
          });
        }
      }
    );
  }
  if (sortBy == "type") {
    conn.query(
      `SELECT * FROM property WHERE status='approved' ORDER BY propertyType`,
      (err, Properties, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (Properties) {
          if (Properties.length <= 0)
            return res.status(200).json({ status: "Success", Properties });

          Properties.forEach((property, index) => {
            conn.query(
              `SELECT image FROM propertyimages WHERE propertyID = '${property.propertyID}'`,
              (err, results, fields) => {
                property.image = results[0].image;

                if (index == Properties.length - 1)
                  return res
                    .status(200)
                    .json({ status: "Success", Properties });
              }
            );
          });
        }
      }
    );
  }
  if (sortBy == "price") {
    conn.query(
      `SELECT * FROM property WHERE status='approved' ORDER BY price`,
      (err, Properties, fields) => {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ status: "Error", Error: "Error occured" });
        }

        if (Properties) {
          if (Properties.length <= 0)
            return res.status(200).json({ status: "Success", Properties });

          Properties.forEach((property, index) => {
            conn.query(
              `SELECT image FROM propertyimages WHERE propertyID = '${property.propertyID}'`,
              (err, results, fields) => {
                property.image = results[0].image;

                if (index == Properties.length - 1)
                  return res
                    .status(200)
                    .json({ status: "Success", Properties });
              }
            );
          });
        }
      }
    );
  }
});

export const fetchLikedAndDislikedGet = TryCatch(async (req, res) => {
  const propertyID = req.params.id ? req.params.id : "";

  if (propertyID == "" || !propertyID)
    return res.status(400).json({ status: "Error", Error: "Error occured" });

  conn.query(
    `SELECT MAX(dislikes) FROM dislikedproperty WHERE propertyID='${propertyID}'`,
    (err, DislikedProperties, fields) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      }

      if (DislikedProperties) {
        console.log(DislikedProperties);
      }
    }
  );
});
