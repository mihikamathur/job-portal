import { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

const ManagePolicies = () => {

  const navigate = useNavigate()

  const [policies, setPolicies] = useState(false)

  const { backendUrl, companyToken } = useContext(AppContext)

  // Function to fetch company Policy data 
  const fetchCompanyPolicies = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/company/list-policies',
        { headers: { token: companyToken } }
      )

      if (data.success) {
        setPolicies(data.policiesData.reverse())
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  // Function to change Policy Visibility 
  const changePolicyVisiblity = async (id) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/company/change-visiblity',
        { id },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchCompanyPolicies()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyPolicies()
    }
  }, [companyToken])

  return policies ? policies.length === 0 ? (
    <div className='flex items-center justify-center h-[70vh]'>
      <p className='text-xl sm:text-2xl'>No Policies Available or posted</p>
    </div>
  ) : (
    <div className='container p-4 max-w-5xl'>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>#</th>
              <th className='py-2 px-4 border-b text-left'>Policy Title</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-2 px-4 border-b text-center'>Applicants</th>
              <th className='py-2 px-4 border-b text-left'>Visible</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy, index) => (
              <tr key={index} className='text-gray-700'>
                <td className='py-2 px-4 border-b max-sm:hidden'>{index + 1}</td>
                <td className='py-2 px-4 border-b' >{policy.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden' >{moment(policy.date).format('ll')}</td>
                <td className='py-2 px-4 border-b max-sm:hidden' >{policy.location}</td>
                <td className='py-2 px-4 border-b text-center' >{policy.applicants}</td>
                <td className='py-2 px-4 border-b' >
                  <input onChange={() => changePolicyVisiblity(policy._id)} className='scale-125 ml-4' type="checkbox" checked={policy.visible} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex justify-end'>
        <button onClick={() => navigate('/dashboard/add-policy')} className='bg-black text-white py-2 px-4 rounded'>Add new policy</button>
      </div>
    </div>
  ) : <Loading />
}

export default ManagePolicies