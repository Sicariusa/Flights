import { Suspense } from "react";
// Importing Suspense from React, which allows for displaying a fallback while waiting for a lazy-loaded component

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// Importing Route, Router, and Routes from react-router-dom for handling routing in the application

import { MapboxHome } from "./pages/mapbox-home";
// Importing the MapboxHome component from the specified path

import { Rings } from "react-loader-spinner";
// Importing the Rings loader component from the react-loader-spinner library to show while loading components

export const App = () => {
  return (
    <Router>
      {/* The Router component wraps the entire application to enable routing */}
      <Suspense fallback={
        // The fallback prop of Suspense specifies the UI to show while waiting for the lazy-loaded component
        <Rings
          color="#008FFF" // Color of the loader
          width={180} // Width of the loader
          height={180} // Height of the loader
        />
      }>
        <Routes>
          {/* The Routes component is used to define all the routes in the application */}
          <Route path="/" Component={MapboxHome} />
          {/* The Route component defines a route, with the path prop specifying the URL path */}
          {/* The Component prop specifies the component to render for that path */}
        </Routes>
      </Suspense>
    </Router>
  );
};
// Exporting the App component as the default export
