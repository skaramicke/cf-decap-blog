// Admin.js
import CMS from "netlify-cms-app";

export default function Admin() {
  CMS.init(); // Initialize the CMS
  return (
    <div id="nc-root" /> // This div is needed for Netlify CMS
  );
}
