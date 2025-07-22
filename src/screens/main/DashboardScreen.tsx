import React from 'react'
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

const DashboardScreen = () => {

  return (
    <View className="flex-1 bg-white justify-center px-6">
      {/* Top Icons */}
      <View className="absolute top-12 right-6 flex-row items-center space-x-4">
        {/* Refresh Icon */}
        <TouchableOpacity>
           <Image 
            source={require('../../assets/icons/history.png')}
            style={{ width: 50, height: 50, marginRight: 8 }}
            resizeMode="contain"
            />
        </TouchableOpacity>
        
        {/* User Avatar with Status */}
        <View className="relative">
          <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
            <Feather name="user" size={24} color="#666" />
          </View>
          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
        </View>
      </View>

      {/* Greeting */}
     <View className='space-y-8 mb-4'>
         <Text className="text-4xl font-bold text-purple-700 mb-2">Hello Javier!</Text>
      <Text className="text-gray-400 tracking-wider mb-6 text-xl">
        Give any command from creating a document to scheduling a meeting.
      </Text>
     </View>

      {/* Action Buttons */}
      <View className="flex-row flex-wrap gap-8  mb-[3rem]">
        <TouchableOpacity className="w-[45%] border border-purple-400 rounded-xl p-6 h-[7rem] items-center justify-center">
          <Text className="text-center text-gray-700 font-medium">Create a Channel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[45%] border border-purple-400 rounded-xl p-6 h-[7rem] items-center justify-center">
          <Text className="text-center text-gray-700 font-medium">Schedule a Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-[45%] border border-purple-400 rounded-xl p-6 h-[7rem] items-center justify-center">
          <Text className="text-center text-gray-700 font-medium">Assign a Task</Text>
        </TouchableOpacity>
      </View>

      {/* Prompt */}
      <View className="rounded-full border border-purple-400 bg-gray-100 px-4 py-2 flex-row items-center">
        <TextInput placeholder="Enter a prompt here" className="flex-1 text-gray-700" />
        <Feather name="mic" size={20} color="#aaa" />
      </View>
    </View>
  )
}

export default DashboardScreen