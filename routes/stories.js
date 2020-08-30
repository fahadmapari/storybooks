const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

// @desc show add page
// @route GET /stories/add

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @desc show one story
// @route GET /stories/:id

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id })
      .populate("user")
      .lean();

    if (!story) return res.render("error/404");

    res.render("stories/show", { story });
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

// @desc show user stories
// @route GET /stories/user/:id

router.get("/user/:id", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.params.id, status: "public" })
      .populate("user")
      .lean();

    if (!stories) return res.render("error/404");

    res.render("stories/index", { stories });
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

// @desc process add form
// @route POST /stories

router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

// @desc show all stories
// @route GET /stories

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.message(err);
    res.render("error/500");
  }
});

// @desc show edit page
// @route GET /edit/:id

router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();

    if (!story) return res.render("error/404");

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc edit story
// @route PUT /stories/:id

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc delete story
// @route DELETE /stories/:id

router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findOne({ _id: req.params.id });

    if (!story) return res.render("error/404");

    if (story.user != req.user.id) return res.redirect("/");

    await Story.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

module.exports = router;
