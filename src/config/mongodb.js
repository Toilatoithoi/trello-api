/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

const MONGODB_URI = 'mongodb+srv://hts_dev:yK8amlkKd9CvWRvW@cluster0.jwt8s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const DATABASE_NAME = 'trello-mern-stack-pro'

import { MongoClient, ServerApiVersion } from 'mongodb'

// Khởi tạo một đối tưởng trelloDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

// Khởi tạo một đối tượng Client Instance để connect tới MongoDB
const mongoClinetInstance = new MongoClient(MONGODB_URI, {
  // Lưu ý: cái serverApi có từ phiên bản 5.0.0 trở lên, có thể không cần dùng đến nó, còn nếu dùng nó là chúng ta sẽ chị định một cái Stable API Version của MongoDB
  // Đọc thêm ở đây: https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới Database
export const CONNECT_DB = async() => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của clientInstance
  await mongoClinetInstance.connect()

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClinetInstance.db(DATABASE_NAME)
}

// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
  console.log('code chạy vào chỗ Close này')
  await mongoClinetInstance.close()
}

// Fuction GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nới khác nhau trong code
// Lưu ý phải đảm bảo chỉ luôn gọi cái getDB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database frist!')
  return trelloDatabaseInstance
}