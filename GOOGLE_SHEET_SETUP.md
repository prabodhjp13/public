# 📔 How to Connect your Google Sheet

This app uses a small **Google Apps Script** to act as a bridge between your static webpage and your Google Sheet.

## 1. Prepare your Google Sheet
- Create a new Google Sheet.
- Rename the first tab to `Menu`. 
  - Column A: `Breakfast`
  - Column B: `Lunch`
  - Column C: `Dinner`
- Add your favorite dishes under each column.
- Create a second tab named `History`.
  - Column A: `Date`
  - Column B: `Meal`
  - Column C: `Dish`

## 2. Create the script bridge
1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Delete any existing code and paste the following:

```javascript
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Menu");
  var data = sheet.getDataRange().getValues();
  
  var result = { breakfast: [], lunch: [], dinner: [] };
  
  // Skip headers, map data
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) result.breakfast.push(data[i][0]);
    if (data[i][1]) result.lunch.push(data[i][1]);
    if (data[i][2]) result.dinner.push(data[i][2]);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("History");
  var payload = JSON.parse(e.postData.contents);
  
  sheet.appendRow([new Date(), payload.meal, payload.dish]);
  
  return ContentService.createTextOutput("Saved");
}
```

3. Click **Deploy > New Deployment**.
4. Select type **Web App**.
5. Map **Execute as** to `Me`.
6. Map **Who has access** to `Anyone`. (This is necessary for your static page to reach it).
7. Copy the **Web App URL**.

## 3. Update your app
1. Open `menu-spinner/app.js`.
2. Find `SCRIPT_URL` at the top.
3. Replace `'REPLACE_WITH_YOUR_APPS_SCRIPT_URL'` with the URL you just copied.

## 4. Hosting on Google Drive
1. Upload the `menu-spinner` folder to Google Drive.
2. Go to [https://drv.tw](https://drv.tw).
3. Select "Host on Google Drive" and authorize.
4. It will give you a public URL to share with the mother/family!
