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
    `SELECT * FROM users WHERE accountType='${accountType}'`,
    (err, results, fields) => {
      if (err)
        return res
          .status(400)
          .json({ status: "Error", Error: "Error occured" });
      if (results) {
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
              if (err)
                return res
                  .status(400)
                  .json({ status: "Error", Error: "Error occured" });

              if (results) {
                conn.query(
                  `SELECT userId, name, username, accountType, email FROM users WHERE username='${username}'`,
                  (err, results, fields) => {
                    if (err)
                      return res
                        .status(400)
                        .json({ status: "Error", Error: "Error occured" });

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
    `INSERT INTO property (propertyName, propertyType, propertyLocation, propertyDescription, bedrooms, bathrooms, map, price) VALUES ('${propertyName}', '${propertyType}', '${propertyLocation}', '${propertyDescription}', '${bedrooms}', '${bathrooms}', '${map}', '${cost}')`,
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

  console.log(req.body);
});

export const fetchPropertiesGet = TryCatch(async (req, res) => {
  conn.query("SELECT * FROM property", (err, results, fields) => {
    let Properties = results;

    if (err) {
      return res.status(400).json({ status: "Error", Error: "Error occured" });
    }

    if (Properties) {
      if (Properties.length <= 0)
        return res.status(200).json({ status: "Success", Properties });

      for (let property of Properties) {
        conn.query(
          `SELECT image FROM propertyimages WHERE propertyID = '${property.propertyID}'`,
          (err, results, fields) => {
            console.log(results);
            property.image = results[0].image;
            res.status(200).json({ status: "Success", Properties });
          }
        );
      }
    }
  });
});
