/**
 * Abouts Page
 * Public-facing about page with friendly description
 * Detailed implementation will be added later
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Abouts Component
 * Displays a friendly description for the about page
 * This is a placeholder page - detailed implementation will be added later
 *
 * @returns JSX element containing friendly description
 */
const Abouts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-10 lg:p-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              About Us
            </h1>
            <div className="max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-4">
                Welcome! We're passionate about creating innovative solutions and delivering exceptional results.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
                Our team is dedicated to building meaningful projects that make a difference. We believe in collaboration, creativity, and continuous improvement.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                We're currently working on bringing you more detailed information about our mission, values, and team. Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Abouts

