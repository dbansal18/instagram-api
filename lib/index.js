const puppeteer = require("puppeteer");
const stringEvaluater = require("./evalString");
class Profile {
  constructor(username) {
    this.username = username;
    this.followers = "";
    this.following = "";
    this.noOfPosts = "";
    this.postLinks = [];
    this.postData = {};
  }
  async getMetaData() {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", req => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.goto("https://www.instagram.com/" + this.username);
    await page.hover(".v1Nh3");
    let data = await page.evaluate(() => {
      if (document.querySelectorAll("meta")) {
        let abc = document.querySelectorAll(".qn-0x")[0];
        let testContent = abc.innerHTML;
        let meta = document.querySelectorAll("meta")[16].content;
        meta = meta.replace(/,/g, "");
        const postLinks = document.querySelectorAll(".kIKUG a");
        const linkArray = [];
        Array.from(postLinks).forEach(link => {
          linkArray.push(link.href);
        });
        const contentSplit = meta.split(" ");
        return {
          followers: contentSplit[0],
          following: contentSplit[2],
          noOfPosts: contentSplit[4],
          links: linkArray,
          test: testContent
        };
      }
    });
    console.log(data.test);
    if (data) {
      this.followers = stringEvaluater(data.followers);
      this.following = stringEvaluater(data.following);
      this.noOfPosts = stringEvaluater(data.noOfPosts);
      this.postLinks = data.links;
    }
    await browser.close();
  }
}

let prof = new Profile("selenagomez");
prof
  .getMetaData()
  .then(() => {
    console.log(prof);
  })
  .catch(err => {
    console.log(err);
  });
