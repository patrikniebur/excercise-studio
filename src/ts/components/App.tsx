import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  Outlet,
  RootRoute,
  Router,
  Route,
  RouterProvider,
} from "@tanstack/react-router";

import { GlobalContextProvider, useGlobalContext } from "../GlobalContext";
import { Initialize } from "../Views/Initialize";
import { Home } from "../Views/Home";
import { ExerciseRunner } from "../Views/ExerciseRunner";

const rootRoute = new RootRoute({
  component: () => {
    const { isInitialized } = useGlobalContext()
    return (
      <>
        {isInitialized() ? <Outlet /> : <Initialize />}
      </>
    );
  },
});

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const runnerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'exercise',
  component: ExerciseRunner
})

const routeTree = rootRoute.addChildren([homeRoute, runnerRoute]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const theme = extendTheme({
  styles: {
    global: {
      "html, body, #app": {
        height: "100%",
        margin: 0,
        padding: 0,
      },
      body: {
        backgroundColor: "#1f1711",
        color: "#eeeeee",
      },
    },
  },
});

export function App() {
  return (
    <GlobalContextProvider>
      <ChakraProvider theme={theme}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </GlobalContextProvider>
  );
}
