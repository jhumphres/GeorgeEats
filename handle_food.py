#At the top of main.py include the following (in addition to the existing import aiohttp import web

IMPORT aiohttp

#Include the below line to start_Services() below the existing routes
app.router.add_get('/letseat', self.handle_food)

# Include the below code in main.py - ABOVE start_services()
async def handle_food(self, request):
        """Handle fetching restaurant data from Google Sheets."""
        try:
            # Google Sheets API endpoint
            google_sheets_url = "https://script.google.com/macros/s/AKfycbzl3j5Nr64h0znR-2TcbspuRa8yjyVRdvOgP4F-NcMNw8Kk6gzUc5mQq2QhvMDnP4I/exec"
            
            # Create a session and fetch the data
            async with aiohttp.ClientSession() as session:
                async with session.get(google_sheets_url) as response:
                    if response.status != 200:
                        return web.json_response({
                            'message': f"Failed to fetch restaurant data: HTTP {response.status}",
                            'error': True
                        }, status=500)
                    
                    # Get JSON data
                    restaurant_data = await response.json()
                    
                    # Return the data
                    return web.json_response({
                        'message': "Restaurant data fetched successfully",
                        'data': restaurant_data,
                        'error': False
                    })
                    
        except Exception as e:
            logger.exception(f"Error fetching restaurant data: {str(e)}")
            return web.json_response({
                'message': f"Error fetching restaurant data: {str(e)}",
                'error': True
            }, status=500)
