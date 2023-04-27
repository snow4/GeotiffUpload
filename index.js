// Dependencies
import AWS from "aws-sdk";
import fs from "fs";
// import * as Uploads from "@mapbox/mapbox-sdk";
import Uploads from "@mapbox/mapbox-sdk/services/uploads.js";
import mapboxgl from "mapbox-gl";

const uploadsClient = new Uploads({
  accessToken: process.env.MAPBOX_SECRET_ACCESS_TOKEN,
  mapboxgl: mapboxgl,
});

const getCredentials = async () => {
  return await uploadsClient
    .createUploadCredentials()
    .send()
    .then((response) => {
      console.log("log ", response.body);
      return response.body;
    });
};

const putFileOnS3 = (credentials) => {
  const s3 = new AWS.S3({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    region: "us-east-1",
  });
  return s3.putObject(
    {
      Bucket: credentials.bucket,
      Key: credentials.key,
      Body: fs.createReadStream("Orthomosaic_map.tif"),
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        uploadsClient
          .createUpload({
            tileset: `globhe.test`,
            url: credentials.url,
            name: "TravreseBayTest",
          })
          .send()
          .then((response) => {
            const upload = response.body;
            console.log("upload", upload);
          });

        console.log("file uploaded successfully", data);
      }
    }
  );
};

// getCredentials().then(putFileOnS3);

// OUTPUT
// upload {
//   id: 'clgwat9um06432ikmxnc35se1',
//   name: 'TravreseBay',
//   complete: false,
//   error: null,
//   created: '2023-04-25T13:24:02.987Z',
//   modified: '2023-04-25T13:24:02.987Z',
//   tileset: 'globhe.traverse',
//   owner: 'globhe',
//   progress: 0}
