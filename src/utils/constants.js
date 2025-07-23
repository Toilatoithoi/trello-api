/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { env } from '~/config/environment'

// Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173' // Không cần localhost nữa vì file config/cros đã luôn luôn  cho phép môi trường dev (env.BUILD_MODE ='dev')
  // ...vv ví dụ sau này sẽ deploy lên domain chính thức ...vv
  'https://trello-web-henna-eta.vercel.app'
]

export const BOARD_TYPES = {
  'PUBLIC': 'public',
  'PRIVATE': 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT