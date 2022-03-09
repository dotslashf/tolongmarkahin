module.exports = {
  commands: [
    {
      command: '/createFolder',
      help: '/createFolder [namafolder]',
      description: 'Membuat folder, nama folder tidak boleh menggunakan spasi',
    },
    {
      command: '/buatFolder',

      help: '/buatFolder [namafolder]',
      description: 'Sama dengan /createFolder',
    },
    {
      command: '/ke',
      help: '/ke [namafolder] [link tweet]',
      description:
        'Menyimpan bookmark pada folder spesifik, link tweet bookmark dapat lebih dari satu',
    },
    {
      command: '/to',
      help: '/to [namafolder] [link tweet]',
      description: 'Sama dengan /ke',
    },
    {
      command: '/listFolder',

      help: '',
      description: 'Memunculkan list folder bookmark',
    },
    {
      command: '/help',
      help: '',
      description: 'Menampilkan pesan ini',
    },
  ],
};
