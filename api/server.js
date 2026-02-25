require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const { JSDOM } = require("jsdom");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json({ limit: "65mb" }));
app.use(express.urlencoded({ limit: "65mb", extended: true }));
app.use(cors());

const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || "http://127.0.0.1:1337";
const APP_BASE_URL = process.env.APP_BASE_URL || "http://127.0.0.1:3000";
const SPEEDY_INDEX_API_KEY = process.env.SPEEDY_INDEX_API_KEY ?? "";

// Function to download an image
const downloadImage = async (url) => {
  const fetch = (await import("node-fetch")).default;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const tempPath = path.join(__dirname, `temp_${Date.now()}.jpg`);

  fs.writeFileSync(tempPath, Buffer.from(buffer));
  return tempPath;
};

// Function to upload file to Strapi
const uploadToStrapi = async (filePath, apiToken) => {
  const formData = new FormData();
  formData.append("files", fs.createReadStream(filePath));

  const response = await axios.post(`${STRAPI_BASE_URL}/api/upload`, formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: apiToken,
    },
  });

  fs.unlinkSync(filePath); // Remove temp file

  if (response.data && response.data.length > 0) {
    return { id: response.data[0].id, url: response.data[0].url }; // Ensure valid file ID is returned
  } else {
    throw new Error("File upload failed. No ID returned.");
  }
};

// Function to extract image URLs from HTML content
const extractImageUrls = (htmlContent) => {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  const imgTags = document.querySelectorAll("img");

  let imageUrls = [];
  imgTags.forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      imageUrls.push(src);
    }
  });

  return imageUrls;
};

// Function to replace image URLs in HTML content
const replaceImageUrlsInContent = async (htmlContent, apiToken) => {
  const imageUrls = extractImageUrls(htmlContent);
  let updatedContent = htmlContent;

  for (const imageUrl of imageUrls) {
    // if (
    //   !imageUrl.startsWith(
    //     process.env.ASSETS_URL ?? "https://res.cloudinary.com/dfct6sli3/"
    //   )
    // ) {
    try {
      const localPath = await downloadImage(imageUrl);
      const uploadedUrl = (await uploadToStrapi(localPath, apiToken)).url;

      if (uploadedUrl) {
        updatedContent = updatedContent.replace(
          new RegExp(imageUrl, "g"),
          `${STRAPI_BASE_URL}${uploadedUrl}`
        );
      }
    } catch (error) {
      console.error("❌ Image processing failed:", error);
    }
    // }
  }

  return updatedContent;
};

// API to create a review
app.post("/create-review", async (req, res) => {
  try {
    const apiToken = req.headers.authorization;
    if (!apiToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: API Token is missing" });
    }

    const payload = req.body;

    if (!payload.avatar && payload.avatar_url) {
      try {
        const localPath = await downloadImage(payload.avatar_url);
        const uploadedFileId = (await uploadToStrapi(localPath, apiToken)).id;
        if (uploadedFileId) {
          payload.avatar = uploadedFileId; // Ensure it's an object with ID
          delete payload.avatar_url;
        }
      } catch (uploadError) {
        payload.avatar = undefined;
        console.error("❌ Logo upload failed:", uploadError);
        return res.status(uploadError?.response?.status || 500).json({
          message: "Logo upload failed",
          error: uploadError?.response?.data || uploadError?.message,
        });
      }
    }

    if (payload.content) {
      payload.content = await replaceImageUrlsInContent(
        payload.content,
        apiToken
      );
    }

    let isPublished = false;

    if (payload.publishedAt !== undefined) {
      const publishedAtValue = String(payload.publishedAt).toLowerCase();
      isPublished = publishedAtValue === "publish" || publishedAtValue === "published";
    }
    else if (payload.review_status !== undefined) {
      isPublished = payload.review_status === 1 || payload.review_status === "1" || payload.review_status === true;
    }

    const publishedAt = isPublished ? new Date() : null;

    const response = await axios.post(
      `${STRAPI_BASE_URL}/api/reviews`,
      {
        data: {
          meta: {
            title: payload.meta_title || "",
            description: payload.meta_description || "",
          },
          slug: payload.slug || "",
          title: payload.title || "",
          rating: payload.rating || undefined,
          logo: payload.avatar || undefined,
          external_link: payload.external_link || "",
          content: payload.content || "",
          review_category:
            payload.main_category || payload.categories?.[0] || undefined,
          review_categories: payload.categories || undefined,
          publishedAt: publishedAt,
        },
      },
      {
        headers: {
          Authorization: apiToken,
        },
      }
    );

    res.status(response.status).json({
      data: response.data,
      status: true,
      message: "Review successfully added",
    });
  } catch (error) {
    res.status(error?.response?.status || 500).json({
      data: null,
      status: false,
      message: error?.message || "Failed to create review",
      error: error?.response?.data || error?.message,
    });
  }
});

// API to search reviews
app.get("/review", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        data: null,
        status: false,
        message: "Query parameter is required",
      });
    }

    const filters = {
      $or: [
        { meta: { title: { $contains: query } } },
        { meta: { description: { $contains: query } } },
        { title: { $contains: query } },
        { content: { $contains: query } },
      ],
    };

    let allReviews = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get(`${STRAPI_BASE_URL}/api/reviews`, {
        params: {
          filters,
          pagination: { page, pageSize: 100 }, // Fetch 100 results per request
          populate: "meta",
        },
      });

      if (response.data?.data?.length > 0) {
        allReviews.push(...response.data.data);
        page++;
      } else {
        hasMore = false; // Stop if no more results
      }
    }

    res.status(200).json({
      data: allReviews,
      status: true,
      message: "All reviews fetched successfully",
    });
  } catch (error) {
    res.status(error?.response?.status || 500).json({
      data: null,
      status: false,
      message: error?.message || "Failed to search reviews",
      error: error?.response?.data || error?.message,
    });
  }
});

// API to check index status by SpeedyIndex
app.get("/index-checker", async (req, res) => {
  try {
    if (!SPEEDY_INDEX_API_KEY) {
      return res.status(400).json({
        data: null,
        status: false,
        message: "Please use the valid speedy index api key",
      });
    }

    // Extract API token
    const apiToken = req.headers.authorization;
    if (!apiToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: API Token is missing" });
    }

    // Check existing tasks
    const notCompletedTasksRes = await axios.get(
      `${STRAPI_BASE_URL}/api/index-checkers`,
      {
        params: {
          filters: {
            is_completed: false,
          },
          pagination: { page: 1, pageSize: 100 },
        },
      }
    );
    const notCompletedTasks = notCompletedTasksRes.data.data;
    notCompletedTasks.forEach(async (nct) => {
      const url = `https://api.speedyindex.com/v2/task/${nct.attributes.type}/checker/report`;
      const checkedTaskRes = await axios.post(
        url,
        {
          data: {
            task_id: nct.attributes.api_id,
          },
        },
        { headers: { Authorization: SPEEDY_INDEX_API_KEY } }
      );
      const checkedTask = checkedTaskRes.data;
      if (checkedTask?.code === 0) {
        if (checkedTask.result.size === checkedTask.result.processed_count) {
          const indexed_result = JSON.stringify(
            checkedTask.result.indexed_links
          );
          const unindexed_result = JSON.stringify(
            checkedTask.result.unindexed_links
          );
          await axios.put(
            `${STRAPI_BASE_URL}/api/index-checkers/${nct.id}`,
            {
              data: {
                is_completed: true,
                indexed_result,
                unindexed_result,
              },
            },
            {
              headers: {
                Authorization: apiToken,
              },
            }
          );
        }
      }
    });

    // Make a new task
    let allReviews = [];
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const response = await axios.get(`${STRAPI_BASE_URL}/api/reviews`, {
        params: {
          filters: {
            is_indexed_value: { $lt: 3 },
            review_category: { $notNull: true },
          },
          pagination: { page, pageSize: 100 },
          populate: {
            review_category: {
              fields: "slug",
            },
          },
        },
      });
      const { data, meta } = response.data;
      allReviews = allReviews.concat(data);
      totalPages = meta.pagination.pageCount;
      page++;
    }
    const urlsForGoogle = allReviews
      .filter((r) => [0, 1].includes(r.attributes.is_indexed_value))
      .map(
        (r) =>
          `${APP_BASE_URL}/${r.attributes.review_category.data.attributes.slug}/${r.attributes.slug}`
      );
    const urlsForYandex = allReviews
      .filter((r) => [0, 2].includes(r.attributes.is_indexed_value))
      .map(
        (r) =>
          `${APP_BASE_URL}/${r.attributes.review_category.data.attributes.slug}/${r.attributes.slug}`
      );
    await axios.post(
      `https://api.speedyindex.com/v2/task/google/checker/create`,
      {
        urls: urlsForGoogle,
      },
      {
        headers: {
          Authorization: SPEEDY_INDEX_API_KEY,
        },
      }
    );
    await axios.post(
      `https://api.speedyindex.com/v2/task/yandex/checker/create`,
      {
        urls: urlsForYandex,
      },
      {
        headers: {
          Authorization: SPEEDY_INDEX_API_KEY,
        },
      }
    );
  } catch (error) {
    res.status(error?.response?.status || 500).json({
      data: null,
      status: false,
      message: error?.message || "Failed to check index status",
      error: error?.response?.data || error?.message,
    });
  }
});

// API to upload multi base64 images
app.post("/upload-images", async (req, res) => {
  try {
    console.log("📥 Received image upload request");

    // Extract API token
    const apiToken = req.headers.authorization;
    if (!apiToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: API Token is missing" });
    }

    const { image_bytes } = req.body;

    if (
      !image_bytes ||
      !Array.isArray(image_bytes) ||
      image_bytes.length === 0
    ) {
      console.log("⚠️ Invalid payload: No images provided");
      return res.status(400).json({
        message: "Invalid payload. Provide an array of Base64 images.",
      });
    }

    let uploadedImages = [];

    for (const base64Image of image_bytes) {
      try {
        console.log("🔄 Processing an image...");

        if (!base64Image.startsWith("data:image/")) {
          console.log("⚠️ Skipping non-image data");
          continue;
        }

        // Extract image type (png, jpeg, etc.)
        const matches = base64Image.match(/^data:image\/(\w+);base64,/);
        if (!matches || matches.length !== 2) {
          console.log("⚠️ Skipping invalid Base64 image data");
          continue;
        }

        const imageType = matches[1];
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Check image size (Max: 50MB)
        if (buffer.length > 50 * 1024 * 1024) {
          console.log("⚠️ Skipping image >50MB");
          continue;
        }

        require("image-size")(buffer); // Ensure valid image

        const fileName = `uploaded_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 5)}.${imageType}`;
        const filePath = path.join(__dirname, fileName);

        // Save image temporarily
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Image saved locally: ${filePath}`);

        // Upload to Strapi
        const formData = new FormData();
        formData.append("files", fs.createReadStream(filePath));

        const response = await axios.post(
          `${STRAPI_BASE_URL}/api/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: apiToken,
            },
          }
        );

        fs.unlinkSync(filePath);
        console.log(`✅ Temporary file deleted: ${filePath}`);

        if (response.data && response.data.length > 0) {
          uploadedImages.push({
            imageUrl: `${STRAPI_BASE_URL}${response.data[0].url}`,
            fileId: response.data[0].id,
          });
          console.log(
            `✅ Image uploaded successfully: ${response.data[0].url}`
          );
        } else {
          console.log("⚠️ No response from Strapi. Skipping image.");
        }
      } catch (error) {
        console.error(`❌ Failed to process image: ${error.message}`);
      }
    }

    if (uploadedImages.length === 0) {
      return res
        .status(500)
        .json({ message: "No images uploaded successfully." });
    }

    return res.json({
      success: true,
      uploadedImages,
      message: "Images uploaded successfully",
    });
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    res.status(error?.response?.status || 500).json({
      message: "Image upload failed",
      error: error?.response?.data || error?.message,
    });
  }
});

// Start server (bind to localhost only for security)
const HOST = process.env.HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
});
