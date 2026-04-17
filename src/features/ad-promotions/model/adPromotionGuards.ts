/** Admin promotion routes: user id segment validation. */
export { isValidAdId } from '../../profile-ad/model/adId'

export function isValidUserId(userId: number): boolean {
  return Number.isFinite(userId) && userId >= 1
}
