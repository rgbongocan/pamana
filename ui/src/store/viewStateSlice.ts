import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../app/createAppSlice";


// unnecessary?
export const initialState = {
  latitude: 11.6978351,
  longitude: 122.6217542,
  zoom: 4.8,
  bearing: 0,
  dragRotate: false,
  // @ts-ignore
  // transitionDuration: 1000,
  // transitionInterpolator: new FlyToInterpolator(),
  // transitionInterruption: TRANSITION_EVENTS.IGNORE,
};

// export const viewStateSlice = createAppSlice({
//   name: "viewState",
//   initialState,
//   reducers: create => ({
//     updateViewState: create.reducer(
//       (state, action: PayloadAction) => {
//         const payload = action.payload;
//         const { latitude, longitude, zoom } = payload;
//         state.latitude = latitude;
//         state.longitude = longitude;
//         state.zoom = zoom;
//       },
//     ),
//   })
// });

// export const { updateViewState } = viewStateSlice.actions;