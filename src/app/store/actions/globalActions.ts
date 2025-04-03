import { GlobalState } from '@/app/utils/interfaces'
import { PayloadAction } from '@reduxjs/toolkit'

export const globalActions = {
  setRegModal: (state: GlobalState, action: PayloadAction<string>) => {
    state.regModal = action.payload
  },
}
