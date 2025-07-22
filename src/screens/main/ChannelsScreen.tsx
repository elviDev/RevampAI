// screens/ChannelsScreen.tsx
import React from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'

const channels = [
  {
    title: 'Brainstorming',
    description: "Brainstorming brings team members' diverse experience into play.",
    comments: 12,
    files: 3,
    users: 3, // Number of users instead of image paths
  },
  {
    title: 'Research',
    description: "Researching brings team members' diverse experience into play.",
    comments: 9,
    files: 1,
    users: 3,
  },
  {
    title: 'Mobile App',
    description: "Brainstorming brings team members' diverse experience into play.",
    comments: 12,
    files: 0,
    users: 3,
  },
]

const ChannelsScreen = () => {

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      {/* Prompt Input */}
      <View className="mb-4 rounded-full bg-gray-100 px-4 py-2 flex-row items-center">
        <TextInput placeholder="Enter a prompt here" className="flex-1 text-gray-700" />
        <Feather name="mic" size={20} color="#aaa" />
      </View>

      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-purple-600">Channels</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="p-1">
            <Feather name="sliders" size={20} color="#aaa" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-purple-100 rounded-full p-1">
            <Feather name="plus" size={20} color="#6b46c1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Channel List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {channels.map((channel, idx) => (
          <View key={idx} className="bg-gray-100 rounded-xl p-4 mb-3">
            <Text className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded w-12 text-center mb-2">
              Work
            </Text>
            <Text className="font-bold text-lg text-black">{channel.title}</Text>
            <Text className="text-gray-600 mt-1">{channel.description}</Text>

            <View className="flex-row justify-between items-center mt-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-200 rounded-full items-center justify-center">
                  <Text className="text-purple-600 font-medium text-sm">{channel.users}</Text>
                </View>
                <Text className="text-gray-600 text-sm ml-2">members</Text>
              </View>

              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center space-x-1">
                  <Feather name="message-circle" size={16} color="gray" />
                  <Text className="text-gray-600 text-sm">{channel.comments} comments</Text>
                </View>
                <View className="flex-row items-center space-x-1">
                  <Feather name="file" size={16} color="gray" />
                  <Text className="text-gray-600 text-sm">{channel.files} files</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-around py-3">
        <TouchableOpacity>
          <Feather name="home" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="bell" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="list" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="grid" size={24} color="#6b46c1" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChannelsScreen
