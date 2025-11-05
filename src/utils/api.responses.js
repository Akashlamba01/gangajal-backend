const ApiResponse = {
  successOk: (response, message = "Success!", data = null) => {
    if (typeof message === "object") {
      data = message
      message = "Success!"
    }
    response.status(200).json({ message, code: 200, success: true, data })
  },

  successCreate: (response, message = "Created Successfully!", data = null) => {
    if (typeof message === "object") {
      data = message
      message = "Created Successfully!"
    }
    response.status(201).json({ message, code: 201, success: true, data })
  },

  successAccepted: (
    response,
    message = "Accepted Successfully!",
    data = null
  ) => {
    if (typeof message === "object") {
      data = message
      message = "Accepted Successfully!"
    }
    response.status(202).json({ message, code: 202, success: true, data })
  },

  unknown: (response, message = "Invalid Parameters!", data = null) => {
    response.status(400).json({ message, code: 400, success: false, data })
  },

  unauthorized: (response, message = "Request Unauthorized!", data = null) => {
    response.status(401).json({ message, code: 401, success: false, data })
  },

  notFound: (response, message = "Not found!", data = null) => {
    response.status(404).json({ message, code: 404, success: false, data })
  },

  taken: (response, message = "Data already taken", data = null) => {
    response.status(422).json({ message, code: 422, success: false, data })
  },

  fail: (
    response,
    message = "Some error has occurred, please try again later",
    data = null
  ) => {
    response.status(500).json({ message, code: 500, success: false, data })
  },
}

export default ApiResponse
